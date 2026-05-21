// import { prisma } from '@/config/database'; // TODO: Refactor for MongoDB after API testing
import { callGroqAPI, callGroqAPIWithJSON } from '@/services/groq.service';
import { SQLValidator } from './sql-validator';
import { SQL_GENERATION_PROMPT, CHATBOT_SYSTEM_PROMPT } from './prompts';
import { Visa, Flight, Hotel, Insurance, Invoice, Client } from '@/models/schemas';
import { config } from '@/config/env';

export interface ChatbotQuery {
  userId: string;
  question: string;
  searchMode?: 'hybrid' | 'semantic' | 'keyword';
}

export interface ChatbotResponse {
  answer: string;
  data?: any[];
  query?: string;
  executionTime: number;
  confidence: number;
}

/**
 * Chatbot service - Natural language to SQL
 */
export class ChatbotService {
  /**
   * Process user question and return answer
   */
  static async processQuestion(query: ChatbotQuery): Promise<ChatbotResponse> {
    const startTime = Date.now();

    try {
      console.log('[ChatbotService] processQuestion:', query.question);
      console.log('[ChatbotService] groq.apiKey present?', !!config.groq.apiKey);
      // Attempt to extract intent (module + filters + keywords) using Groq LLM
      let intent: any = null;
      if (config.groq.apiKey) {
        try {
          const intentPrompt = `Extract the user's intent from the following query.

Module patterns:
- FLIGHT: "flight", "show flight", "latest flight", "one flight", "recent flight"
- VISA: "visa", "pending visa", "list visa"
- HOTEL: "hotel", "booking", "room"
- INSURANCE: "insurance", "policy", "claim"
- INVOICE: "invoice", "bill", "payment"
- ANY: ambiguous or general queries

Return ONLY valid JSON:
{"module": "flight|visa|hotel|insurance|invoice|any", "filters": { ... }, "keywords": ["kw1","kw2"]}

Examples:
- "show only one flight, the latest one" → {"module": "flight", "filters": {}, "keywords": []}
- "list pending visas" → {"module": "visa", "filters": {"status": "PENDING"}, "keywords": []}
- "latest hotel booking" → {"module": "hotel", "filters": {}, "keywords": []}

Query: ${query.question}`;
          intent = await callGroqAPIWithJSON<{ module?: string; filters?: any; keywords?: string[] }>(intentPrompt, CHATBOT_SYSTEM_PROMPT);
          console.log('[ChatbotService] intent from Groq:', intent);
        } catch (err) {
          console.warn('Failed to extract intent from Groq, continuing with fallback:', (err as any).message || err);
          intent = null;
        }
      }

      // Step 5: Execute query
      // If Groq API is configured, we prefer intent-driven hybrid search when Groq
      // successfully extracts an intent (module + filters). Fall back to SQL generation
      // only when intent is not available.
      let results: any[] = [];

      // (LLM-driven SQL generation is performed only when configured and no intent was extracted)
      if (config.groq.apiKey && !intent) {
        // Try generating SQL via LLM and validate it
        try {
          const sqlQuery = await this.generateSQL(query.question);

          const validation = SQLValidator.validateQuery(sqlQuery);
          if (!validation.valid) {
            return {
              answer: `I cannot execute that query because: ${validation.error}.`,
              query: sqlQuery,
              executionTime: Date.now() - startTime,
              confidence: 0,
            };
          }

          const sanitizedQuery = SQLValidator.sanitizeQuery(sqlQuery);
          const limitedQuery = SQLValidator.addQueryLimit(sanitizedQuery);
          const tables = SQLValidator.extractTables(limitedQuery);
          const accessCheck = this.checkTableAccess(tables);
          if (!accessCheck.allowed) {
            return {
              answer: `You don't have access to the requested information: ${accessCheck.reason}`,
              executionTime: Date.now() - startTime,
              confidence: 0,
            };
          }

          // We don't execute SQL against MongoDB; return generated SQL as preview
          return {
            answer: `Generated SQL (preview): ${sqlQuery}. The system can run this after migration to SQL or add an adapter.`,
            query: sqlQuery,
            executionTime: Date.now() - startTime,
            confidence: 0.6,
          };
        } catch (err) {
          console.error('LLM SQL generation failed, falling back to local responder', err);
        }
      }

      // If intent specifies a module (but not 'any'), perform a hybrid search (semantic + keyword matching)
      if (intent && intent.module && intent.module.toLowerCase() !== 'any') {
        try {
          const results = await this.hybridSearchWithMode(intent.module, intent.filters || {}, intent.keywords || [], query.question, query.searchMode || 'hybrid');
          const items = results.map((r: any) => ({ module: intent.module.toLowerCase(), title: r.title, details: r }));
          const answer = `Found ${items.length} results in ${intent.module}`;
          return {
            answer,
            data: items,
            query: query.question,
            executionTime: Date.now() - startTime,
            confidence: 0.8,
          };
        } catch (err) {
          console.warn('Hybrid search failed, falling back to rule-based responder', (err as any).message || err);
        }
      }

      // Fallback: simple rule-based queries supported directly against MongoDB collections
      const q = query.question.toLowerCase();

      // Check for latest flight queries (handles LLM extraction failure)
      if ((q.includes('flight') && (q.includes('latest') || q.includes('newest') || q.includes('recent'))) || 
          (q.includes('show') && q.includes('flight') && q.includes('one'))) {
        const { isLatest, limit } = this.detectLatestRequest(query.question);
        if (isLatest) {
          const latest = await Flight.find({}).sort({ createdAt: -1 }).limit(limit).lean();
          if (latest.length > 0) {
            const items = latest.map((f: any) => ({ 
              module: 'flight', 
              title: `${f.airline} - ${f.pnr}`, 
              details: f 
            }));
            return {
              answer: `Found ${items.length} latest flight(s)`,
              data: items,
              query: q,
              executionTime: Date.now() - startTime,
              confidence: 0.9,
            };
          }
        }
      }

      if (q.includes('how many flights') || q.includes('number of flights') || q.includes('how many flight')) {
        const count = await Flight.countDocuments();
        return {
          answer: `There are ${count} flight bookings.`,
          executionTime: Date.now() - startTime,
          confidence: 0.9,
        };
      }

      if (q.includes('pending visas') || q.includes('list pending visas') || q.includes('how many visas')) {
        const pending = await Visa.countDocuments({ status: 'PENDING' });
        return {
          answer: `There are ${pending} pending visas.`,
          executionTime: Date.now() - startTime,
          confidence: 0.9,
        };
      }

      // Fallback: Generic visa search (show visa, list visa, all visas, visa)
      if (q.includes('visa') && !q.includes('pending') && !q.includes('how many')) {
        const visas = await Visa.find({}).sort({ createdAt: -1 }).limit(10).lean();
        if (visas.length > 0) {
          const items = visas.map((v: any) => ({
            module: 'visa',
            title: `${v.applicantName} - ${v.country} (${v.visaType})`,
            details: v
          }));
          return {
            answer: `Found ${items.length} visa records`,
            data: items,
            query: q,
            executionTime: Date.now() - startTime,
            confidence: 0.8,
          };
        }
      }

      // Fallback: Generic flight search (show flight, list flight, all flights, flight)
      if (q.includes('flight') && !q.includes('latest') && !q.includes('how many')) {
        const flights = await Flight.find({}).sort({ createdAt: -1 }).limit(10).lean();
        if (flights.length > 0) {
          const items = flights.map((f: any) => ({
            module: 'flight',
            title: `${f.airline} - ${f.pnr} (${f.sector})`,
            details: f
          }));
          return {
            answer: `Found ${items.length} flight records`,
            data: items,
            query: q,
            executionTime: Date.now() - startTime,
            confidence: 0.8,
          };
        }
      }

      // Fallback: Generic hotel search (show hotel, list hotel, all hotels, hotel)
      if (q.includes('hotel') && !q.includes('latest') && !q.includes('how many')) {
        const hotels = await Hotel.find({}).sort({ createdAt: -1 }).limit(10).lean();
        if (hotels.length > 0) {
          const items = hotels.map((h: any) => ({
            module: 'hotel',
            title: `${h.hotelName} - ${h.city} (${h.roomType})`,
            details: h
          }));
          return {
            answer: `Found ${items.length} hotel records`,
            data: items,
            query: q,
            executionTime: Date.now() - startTime,
            confidence: 0.8,
          };
        }
      }

      // Fallback: Generic insurance search (show insurance, list insurance, all insurance, insurance)
      if (q.includes('insurance') && !q.includes('how many')) {
        const insurance = await Insurance.find({}).sort({ createdAt: -1 }).limit(10).lean();
        if (insurance.length > 0) {
          const items = insurance.map((i: any) => ({
            module: 'insurance',
            title: `${i.holderName} - ${i.insuranceType} (${i.policyNumber})`,
            details: i
          }));
          return {
            answer: `Found ${items.length} insurance records`,
            data: items,
            query: q,
            executionTime: Date.now() - startTime,
            confidence: 0.8,
          };
        }
      }

      if (q.includes('total profit') || q.includes('total profit this') || q.includes('total revenue')) {
        const agg = await Invoice.aggregate([
          { $group: { _id: null, totalCustomer: { $sum: '$customerAmount' }, totalVendor: { $sum: '$vendorCost' } } }
        ]);
        const totalCustomer = (agg[0]?.totalCustomer) || 0;
        const totalVendor = (agg[0]?.totalVendor) || 0;
        const profit = totalCustomer - totalVendor;
        return {
          answer: `Total customer amount: ${totalCustomer}. Total vendor cost: ${totalVendor}. Estimated profit: ${profit}.`,
          executionTime: Date.now() - startTime,
          confidence: 0.9,
        };
      }

      if (q.includes('invoices for client') || q.includes('invoices for')) {
        // Try to extract client name or id
        const match = q.match(/invoices for client (.+)/) || q.match(/invoices for (.+)/);
        if (match && match[1]) {
          const name = match[1].trim();
          const client = await Client.findOne({ name: new RegExp(name, 'i') });
          if (!client) {
            return { answer: `No client found matching "${name}".`, executionTime: Date.now() - startTime, confidence: 0.5 };
          }
          const invoices = await Invoice.find({ clientId: client._id }).limit(20);
          return { answer: `Found ${invoices.length} invoices for ${client.name}.`, data: invoices, executionTime: Date.now() - startTime, confidence: 0.8 };
        }
      }

      // Name-based search: search for person names across all modules
      // Handles queries like "search shaik", "find john", "show records for alex", or just "shaik"
      let searchName: string | null = null;
      
      // First, try keyword-based pattern: "search shaik", "find john", etc.
      const nameSearchPattern = /(?:search|find|show|list|get)(?:\s+(?:records?|data)?\s+for)?\s+(.+?)(?:\s+(?:records?|data)?)?$/i;
      const nameMatch = query.question.match(nameSearchPattern);
      
      if (nameMatch && nameMatch[1]) {
        searchName = nameMatch[1].trim();
      } else if (intent && intent.module && intent.module.toLowerCase() === 'any' && intent.keywords && intent.keywords.length > 0) {
        // Fallback: if Groq says "any" module and extracted keywords, use the first keyword as search term
        searchName = intent.keywords[0].trim();
      }
      
      if (searchName) {
        console.log('[ChatbotService] Searching for name:', searchName);
        // Skip if it's a common query word
        if (!['flights', 'visas', 'hotels', 'insurance', 'invoices', 'clients', 'latest', 'pending', 'profit'].includes(searchName.toLowerCase())) {
          const results: any[] = [];
          const nameRegex = new RegExp(searchName, 'i');
          
          try {
            // Search in Visas (by applicantName)
            const visas = await Visa.find({ 
              $or: [
                { applicantName: nameRegex },
                { 'fullName': nameRegex },
                { 'name': nameRegex }
              ]
            }).limit(10).lean();
            
            console.log('[ChatbotService] Found visas:', visas.length);
            results.push(...visas.map((v: any) => ({
              module: 'visa',
              title: `Visa - ${v.applicantName || v.fullName || v.name} (${v.country})`,
              details: v
            })));

            // Search in Flights (by passengerName)
            const flights = await Flight.find({
              $or: [
                { passengerName: nameRegex },
                { 'name': nameRegex }
              ]
            }).limit(10).lean();
            
            console.log('[ChatbotService] Found flights:', flights.length);
            results.push(...flights.map((f: any) => ({
              module: 'flight',
              title: `Flight - ${f.passengerName || f.name} (${f.airline} ${f.flightNumber})`,
              details: f
            })));

            // Search in Hotels (by guestName or hotelName)
            const hotels = await Hotel.find({
              $or: [
                { guestName: nameRegex },
                { hotelName: nameRegex },
                { 'name': nameRegex }
              ]
            }).limit(10).lean();
            
            console.log('[ChatbotService] Found hotels:', hotels.length);
            results.push(...hotels.map((h: any) => ({
              module: 'hotel',
              title: `Hotel - ${h.guestName || h.hotelName || h.name}`,
              details: h
            })));

            // Search in Insurance (by policyHolderName)
            const insurance = await Insurance.find({
              $or: [
                { policyHolderName: nameRegex },
                { 'name': nameRegex }
              ]
            }).limit(10).lean();
            
            console.log('[ChatbotService] Found insurance:', insurance.length);
            results.push(...insurance.map((i: any) => ({
              module: 'insurance',
              title: `Insurance - ${i.policyHolderName || i.name}`,
              details: i
            })));

            // Search in Clients (by name)
            const clients = await Client.find({
              $or: [
                { name: nameRegex },
                { contactPerson: nameRegex }
              ]
            }).limit(10).lean();
            
            console.log('[ChatbotService] Found clients:', clients.length);
            results.push(...clients.map((c: any) => ({
              module: 'client',
              title: `Client - ${c.name}`,
              details: c
            })));

            console.log('[ChatbotService] Total name search results:', results.length);
            
            // Return results regardless of count
            return {
              answer: results.length > 0 
                ? `Found ${results.length} record(s) matching "${searchName}"` 
                : `No records found matching "${searchName}". Try searching for: Sarah (Visa), Mark (Flight), Emma (Hotel), Michael (Insurance), or ABC Travel / XYZ Corp (Clients).`,
              data: results.length > 0 ? results : undefined,
              query: query.question,
              executionTime: Date.now() - startTime,
              confidence: results.length > 0 ? 0.85 : 0.6,
            };
          } catch (err) {
            console.warn('Name search failed:', (err as any).message || err);
            return {
              answer: `Name search encountered an error. Please try a different search term.`,
              executionTime: Date.now() - startTime,
              confidence: 0.4,
            };
          }
        }
      }

      // Default fallback
      return {
        answer: `I couldn't interpret that question. Try simpler queries like "How many flights?", "List pending visas", or "Total profit".`,
        executionTime: Date.now() - startTime,
        confidence: 0.3,
      };
      // Original code commented out:
      // try {
      //   results = await prisma.$queryRawUnsafe(limitedQuery);
      // } catch (error) {
      //   console.error('Query execution error:', error);
      //   return {
      //     answer: `I encountered an error querying the database. Please rephrase your question.`,
      //     query: limitedQuery,
      //     executionTime: Date.now() - startTime,
      //     confidence: 0.5,
      //   };
      // }

      // Step 6: Format answer
      const answer = this.formatAnswer(query.question, results);

      return {
        answer,
        data: results,
        executionTime: Date.now() - startTime,
        confidence: this.calculateConfidence(results),
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      const msg = (error && (error as any).message) ? (error as any).message : 'unknown error';
      return {
        answer: `Error processing question: ${msg}`,
        executionTime: Date.now() - startTime,
        confidence: 0,
      };
    }
  }

  /**
   * Calculate TF-IDF semantic similarity score
   */
  private static calculateTFIDF(query: string, text: string, allTexts: string[]): number {
    const queryTerms = this.tokenize(query);
    const textTerms = this.tokenize(text);

    if (queryTerms.length === 0 || textTerms.length === 0) return 0;

    let score = 0;
    for (const term of queryTerms) {
      const docsWithTerm = allTexts.filter(t => this.tokenize(t).includes(term)).length;
      const idf = Math.log((allTexts.length + 1) / (docsWithTerm + 1));
      const tf = textTerms.filter(t => t === term).length / textTerms.length;
      score += tf * idf;
    }

    return score / queryTerms.length;
  }

  /**
   * Tokenize text removing stopwords
   */
  private static tokenize(text: string): string[] {
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'show', 'list',
      'get', 'find', 'all', 'have', 'has', 'had', 'do', 'does', 'did', 'will'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2 && !stopwords.has(t));
  }

  /**
   * Calculate keyword match score (0-1)
   */
  private static calculateKeywordScore(query: string, text: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    let matches = 0;
    for (const term of queryTerms) {
      if (term.length > 2 && textLower.includes(term)) {
        matches++;
      }
    }

    return matches / Math.max(queryTerms.length, 1);
  }

  /**
   * Calculate hybrid score (60% semantic + 40% keyword)
   */
  private static calculateHybridScore(
    query: string,
    text: string,
    allTexts: string[],
    mode: 'hybrid' | 'semantic' | 'keyword' = 'hybrid'
  ): { score: number; matchType: 'semantic' | 'keyword' | 'hybrid' } {
    const semanticScore = this.calculateTFIDF(query, text, allTexts);
    const keywordScore = this.calculateKeywordScore(query, text);

    let score = 0;
    let matchType: 'semantic' | 'keyword' | 'hybrid' = 'hybrid';

    switch (mode) {
      case 'semantic':
        score = semanticScore;
        matchType = 'semantic';
        break;
      case 'keyword':
        score = keywordScore;
        matchType = 'keyword';
        break;
      case 'hybrid':
      default:
        score = semanticScore * 0.6 + keywordScore * 0.4;
        matchType = 'hybrid';
        break;
    }

    return { score: Math.min(score, 1.0), matchType };
  }

  /**
   * Perform hybrid search with selectable mode: semantic, keyword, or hybrid
   */
  /**
   * Detect if question is asking for latest/newest items
   */
  private static detectLatestRequest(question: string): { isLatest: boolean; limit: number } {
    const q = question.toLowerCase();
    const isLatest = /\b(latest|newest|last|recent|most recent)\b/.test(q);
    
    // Extract limit (one, two, three, 1, 2, 3, etc.)
    // Default to 1 if asking for latest/newest without specifying a number
    let limit = isLatest ? 1 : 50;
    const numMatches = q.match(/\b(one|two|three|four|five|[1-5])\b/);
    const numWords: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    };
    
    if (numMatches) {
      const matched = numMatches[1];
      limit = numWords[matched] || parseInt(matched) || (isLatest ? 1 : 50);
    }
    
    return { isLatest, limit: Math.max(1, Math.min(limit, 50)) };
  }

  private static async hybridSearchWithMode(module: string, filters: any, keywords: string[], question: string, searchMode: 'hybrid' | 'semantic' | 'keyword' = 'hybrid') {
    const mod = module.toLowerCase();
    const normalizedFilters: any = {};
    if (filters && typeof filters === 'object') {
      if (filters.status) normalizedFilters.status = (filters.status || '').toString().toUpperCase();
      for (const key of Object.keys(filters)) {
        if (key !== 'status') normalizedFilters[key] = filters[key];
      }
    }

    // Detect if asking for latest items and extract requested limit
    const { isLatest, limit } = this.detectLatestRequest(question);

    // ===== FLIGHT MODULE =====
    if (mod === 'flight' || mod === 'flights') {
      const allFlights = await Flight.find(normalizedFilters || {}).limit(100).lean();
      
      // If asking for latest, sort by creation date immediately and limit
      if (isLatest && allFlights.length > 0) {
        const latest = allFlights.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return latest.map((f: any) => ({ ...f, title: `${f.airline} - ${f.pnr}`, searchScore: 1, matchType: 'latest' as const }));
      }

      const allTexts = allFlights.map((f: any) => `${f.airline} ${f.flightNumber} ${f.pnr} ${f.sector} ${f.passengerName}`);

      const scoredFlights = allFlights.map((flight: any, idx: number) => {
        const { score, matchType } = this.calculateHybridScore(question, allTexts[idx], allTexts, searchMode);
        return { ...flight, title: `${flight.airline} - ${flight.pnr}`, searchScore: score, matchType };
      });

      const filtered = scoredFlights.filter((f: any) => f.searchScore > 0.05).sort((a: any, b: any) => b.searchScore - a.searchScore);
      return filtered.length > 0 ? filtered.slice(0, limit) : allFlights.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit).map((f: any) => ({ ...f, title: `${f.airline} - ${f.pnr}`, searchScore: 0, matchType: 'fallback' as const }));
    }

    // ===== VISA MODULE =====
    if (mod === 'visa' || mod === 'visas') {
      const allVisas = await Visa.find(normalizedFilters || {}).limit(100).lean();
      
      // If asking for latest, sort by creation date immediately and limit
      if (isLatest && allVisas.length > 0) {
        const latest = allVisas.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return latest.map((v: any) => ({ ...v, title: `${v.applicantName} - ${v.country}`, searchScore: 1, matchType: 'latest' as const }));
      }

      const allTexts = allVisas.map((v: any) => `${v.applicantName} ${v.country} ${v.visaType} ${v.passportNumber}`);

      const scoredVisas = allVisas.map((visa: any, idx: number) => {
        const { score, matchType } = this.calculateHybridScore(question, allTexts[idx], allTexts, searchMode);
        return { ...visa, title: `${visa.applicantName} - ${visa.country}`, searchScore: score, matchType };
      });

      const filtered = scoredVisas.filter((v: any) => v.searchScore > 0.05).sort((a: any, b: any) => b.searchScore - a.searchScore);
      return filtered.length > 0 ? filtered.slice(0, limit) : allVisas.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit).map((v: any) => ({ ...v, title: `${v.applicantName} - ${v.country}`, searchScore: 0, matchType: 'fallback' as const }));
    }

    // ===== HOTEL MODULE =====
    if (mod === 'hotel' || mod === 'hotels') {
      const allHotels = await Hotel.find(normalizedFilters || {}).limit(100).lean();
      
      // If asking for latest, sort by creation date immediately and limit
      if (isLatest && allHotels.length > 0) {
        const latest = allHotels.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return latest.map((h: any) => ({ ...h, title: `${h.hotelName} - ${h.city}`, searchScore: 1, matchType: 'latest' as const }));
      }

      const allTexts = allHotels.map((h: any) => `${h.hotelName} ${h.city} ${h.roomType} ${h.guestName}`);

      const scoredHotels = allHotels.map((hotel: any, idx: number) => {
        const { score, matchType } = this.calculateHybridScore(question, allTexts[idx], allTexts, searchMode);
        return { ...hotel, title: `${hotel.hotelName} - ${hotel.city}`, searchScore: score, matchType };
      });

      const filtered = scoredHotels.filter((h: any) => h.searchScore > 0.05).sort((a: any, b: any) => b.searchScore - a.searchScore);
      return filtered.length > 0 ? filtered.slice(0, limit) : allHotels.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit).map((h: any) => ({ ...h, title: `${h.hotelName} - ${h.city}`, searchScore: 0, matchType: 'fallback' as const }));
    }

    // ===== INSURANCE MODULE =====
    if (mod === 'insurance' || mod === 'insurances') {
      const allInsurance = await Insurance.find(normalizedFilters || {}).limit(100).lean();
      
      // If asking for latest, sort by creation date immediately and limit
      if (isLatest && allInsurance.length > 0) {
        const latest = allInsurance.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return latest.map((i: any) => ({ ...i, title: `${i.holderName} - ${i.policyNumber}`, searchScore: 1, matchType: 'latest' as const }));
      }

      const allTexts = allInsurance.map((i: any) => `${i.policyNumber} ${i.holderName} ${i.policyType}`);

      const scoredInsurance = allInsurance.map((ins: any, idx: number) => {
        const { score, matchType } = this.calculateHybridScore(question, allTexts[idx], allTexts, searchMode);
        return { ...ins, title: `${ins.holderName} - ${ins.policyNumber}`, searchScore: score, matchType };
      });

      const filtered = scoredInsurance.filter((i: any) => i.searchScore > 0.05).sort((a: any, b: any) => b.searchScore - a.searchScore);
      return filtered.length > 0 ? filtered.slice(0, limit) : allInsurance.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit).map((i: any) => ({ ...i, title: `${i.holderName} - ${i.policyNumber}`, searchScore: 0, matchType: 'fallback' as const }));
    }

    // ===== INVOICE MODULE =====
    if (mod === 'invoice' || mod === 'invoices') {
      const allInvoices = await (Invoice as any).find(normalizedFilters || {}).limit(100).lean();
      
      // If asking for latest, sort by creation date immediately and limit
      if (isLatest && allInvoices.length > 0) {
        const latest = allInvoices.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        return latest.map((inv: any) => ({ ...inv, title: `${inv.invoiceNumber} - ${inv.description || ''}`, searchScore: 1, matchType: 'latest' as const }));
      }

      const allTexts = allInvoices.map((inv: any) => `${inv.invoiceNumber} ${inv.description} ${inv.status}`);

      const scoredInvoices = allInvoices.map((invoice: any, idx: number) => {
        const { score, matchType } = this.calculateHybridScore(question, allTexts[idx], allTexts, searchMode);
        return { ...invoice, title: `${invoice.invoiceNumber} - ${invoice.description || ''}`, searchScore: score, matchType };
      });

      const filtered = scoredInvoices.filter((i: any) => i.searchScore > 0.05).sort((a: any, b: any) => b.searchScore - a.searchScore);
      return filtered.length > 0 ? filtered.slice(0, limit) : allInvoices.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit).map((i: any) => ({ ...i, title: `${i.invoiceNumber} - ${i.description || ''}`, searchScore: 0, matchType: 'fallback' as const }));
    }

    return [];
  }

  /**
   * Perform a hybrid search across collections: simple BM25-like regex search and keyword expansion (legacy)
   */
  private static async hybridSearch(module: string, filters: any, keywords: string[], question: string) {
    // Normalize module name
    const mod = module.toLowerCase();
    const text = question;

    // Helper to build regex queries
    const regex = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, ''), 'i');

    // Basic stopwords to ignore from LLM keywords (common verbs/particles)
    const STOPWORDS = new Set(['show', 'all', 'list', 'get', 'find', 'the', 'a', 'an', 'of', 'for', 'in', 'on', 'is', 'are']);

    // Clean keywords: remove stopwords and very short tokens
    const cleanedKeywords = (keywords || [])
      .map((k: string) => (k || '').toString().trim())
      .map((k: string) => k.toLowerCase())
      .filter((k: string) => k.length > 2 && !STOPWORDS.has(k));

    // If keywords are just the module name (e.g., 'visa' or 'visas'), ignore them
    const usefulKeywords = cleanedKeywords.filter((k: string) => k !== mod && k !== `${mod}s`);

    // If filters are provided (e.g., { status: 'pending' }), normalize certain fields
    const normalizedFilters: any = {};
    if (filters && typeof filters === 'object') {
      if (filters.status) normalizedFilters.status = (filters.status || '').toString().toUpperCase();
      // copy any other simple filters intact
      for (const key of Object.keys(filters)) {
        if (key !== 'status') normalizedFilters[key] = filters[key];
      }
    }

    if (mod === 'flight' || mod === 'flights') {
      // Search fields: pnr, passengerName, airline, sector
      const orClauses: any[] = [];
      // Only add text search if no useful keywords extracted
      if (usefulKeywords.length === 0) {
        orClauses.push({ pnr: regex(text) });
        orClauses.push({ passengerName: regex(text) });
        orClauses.push({ airline: regex(text) });
        orClauses.push({ sector: regex(text) });
      }
      // Build orClauses from useful keywords only
      for (const kw of usefulKeywords) {
        orClauses.push({ $or: [ { pnr: regex(kw) }, { passengerName: regex(kw) }, { airline: regex(kw) } ] });
      }
      // If no filters and no useful keywords, return recent flights
      if (Object.keys(normalizedFilters).length === 0 && usefulKeywords.length === 0) {
        const docs = await Flight.find({}).sort({ createdAt: -1 }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.airline} - ${d.pnr}` }));
      }
      const docs = await Flight.find({ $or: orClauses.length > 0 ? orClauses : [{}], ...normalizedFilters }).limit(50).lean();
      return docs.map((d: any) => ({ ...d, title: `${d.airline} - ${d.pnr}` }));
    }

    if (mod === 'visa' || mod === 'visas') {
      const orClauses: any[] = [];
      // Only add text search if no useful keywords extracted
      if (usefulKeywords.length === 0) {
        orClauses.push({ applicantName: regex(text) });
        orClauses.push({ passportNumber: regex(text) });
        orClauses.push({ country: regex(text) });
      }
      // Build orClauses from useful keywords only
      for (const kw of usefulKeywords) {
        orClauses.push({ $or: [ { applicantName: regex(kw) }, { passportNumber: regex(kw) }, { country: regex(kw) } ] });
      }
      // If explicit filters like status provided, use them
      if (Object.keys(normalizedFilters).length > 0) {
        const docs = await Visa.find({ $or: orClauses.length > 0 ? orClauses : [{}], ...normalizedFilters }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.applicantName} - ${d.country}` }));
      }
      // If no useful keywords extracted and no filters, return recent visas
      if (usefulKeywords.length === 0) {
        const docs = await Visa.find({}).sort({ createdAt: -1 }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.applicantName} - ${d.country}` }));
      }
      const docs = await Visa.find({ $or: orClauses }).limit(50).lean();
      return docs.map((d: any) => ({ ...d, title: `${d.applicantName} - ${d.country}` }));
    }

    if (mod === 'hotel' || mod === 'hotels') {
      const orClauses: any[] = [];
      // Only add text search if no useful keywords extracted
      if (usefulKeywords.length === 0) {
        orClauses.push({ hotelName: regex(text) });
        orClauses.push({ city: regex(text) });
        orClauses.push({ guestName: regex(text) });
      }
      // Build orClauses from useful keywords only
      for (const kw of usefulKeywords) {
        orClauses.push({ $or: [ { hotelName: regex(kw) }, { city: regex(kw) }, { guestName: regex(kw) } ] });
      }
      if (Object.keys(normalizedFilters).length === 0 && usefulKeywords.length === 0) {
        const docs = await Hotel.find({}).sort({ createdAt: -1 }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.hotelName} - ${d.city}` }));
      }
      const docs = await Hotel.find({ $or: orClauses.length > 0 ? orClauses : [{}] }).limit(50).lean();
      return docs.map((d: any) => ({ ...d, title: `${d.hotelName} - ${d.city}` }));
    }

    if (mod === 'insurance' || mod === 'insurances') {
      const orClauses: any[] = [];
      // Only add text search if no useful keywords extracted
      if (usefulKeywords.length === 0) {
        orClauses.push({ policyNumber: regex(text) });
        orClauses.push({ holderName: regex(text) });
      }
      // Build orClauses from useful keywords only
      for (const kw of usefulKeywords) {
        orClauses.push({ $or: [ { policyNumber: regex(kw) }, { holderName: regex(kw) } ] });
      }
      if (Object.keys(normalizedFilters).length === 0 && usefulKeywords.length === 0) {
        const docs = await Insurance.find({}).sort({ createdAt: -1 }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.holderName} - ${d.policyNumber}` }));
      }
      const docs = await Insurance.find({ $or: orClauses.length > 0 ? orClauses : [{}] }).limit(50).lean();
      return docs.map((d: any) => ({ ...d, title: `${d.holderName} - ${d.policyNumber}` }));
    }

    if (mod === 'invoice' || mod === 'invoices') {
      const orClauses: any[] = [];
      // Only add text search if no useful keywords extracted
      if (usefulKeywords.length === 0) {
        orClauses.push({ invoiceNumber: regex(text) });
        orClauses.push({ description: regex(text) });
      }
      // Build orClauses from useful keywords only
      for (const kw of usefulKeywords) {
        orClauses.push({ $or: [ { invoiceNumber: regex(kw) }, { description: regex(kw) } ] });
      }
      if (Object.keys(normalizedFilters).length === 0 && usefulKeywords.length === 0) {
        const docs = await (Invoice as any).find({}).sort({ createdAt: -1 }).limit(50).lean();
        return docs.map((d: any) => ({ ...d, title: `${d.invoiceNumber} - ${d.description || ''}` }));
      }
      const docs = await (Invoice as any).find({ $or: orClauses.length > 0 ? orClauses : [{}] }).limit(50).lean();
      return docs.map((d: any) => ({ ...d, title: `${d.invoiceNumber} - ${d.description || ''}` }));
    }

    // Default: search across all modules (quick fallback)
    const allResults: any[] = [];
    try {
      const flights = await Flight.find({ $or: [{ airline: regex(text) }, { pnr: regex(text) }] }).limit(10).lean();
      flights.forEach((f: any) => allResults.push({ ...f, _module: 'flight', title: `${f.airline} - ${f.pnr}` }));
    } catch (e) {}
    try {
      const visas = await Visa.find({ $or: [{ applicantName: regex(text) }, { passportNumber: regex(text) }] }).limit(10).lean();
      visas.forEach((v: any) => allResults.push({ ...v, _module: 'visa', title: `${v.applicantName} - ${v.country}` }));
    } catch (e) {}

    return allResults;
  }

  /**
   * Generate SQL from natural language question
   */
  private static async generateSQL(question: string): Promise<string> {
    try {
      const prompt = SQL_GENERATION_PROMPT.replace('{query}', question);

      const response = await callGroqAPI(
        prompt,
        'You are a SQL expert. Generate ONLY SELECT queries. No explanations.'
      );

      // Extract SQL from response
      const sqlMatch = response.match(/SELECT[\s\S]*?(?=;|$)/i);
      if (!sqlMatch) {
        throw new Error('No SQL query found in response');
      }

      return sqlMatch[0].trim();
    } catch (error) {
      console.error('SQL generation error:', error);
      throw new Error(
        `Failed to generate SQL: ${(error as Error).message}`
      );
    }
  }

  /**
   * Check table access permissions
   */
  private static checkTableAccess(
    tables: string[]
  ): { allowed: boolean; reason?: string } {
    const allowedTables = [
      'users',
      'clients',
      'invoices',
      'invoice_items',
      'visas',
      'flights',
      'hotels',
      'insurance',
    ];

    for (const table of tables) {
      if (!allowedTables.includes(table.toLowerCase())) {
        return {
          allowed: false,
          reason: `Table "${table}" is not accessible`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Format query results into human-readable answer
   */
  private static formatAnswer(question: string, results: any[]): string {
    if (results.length === 0) {
      return `No results found for your query about "${question}".`;
    }

    if (results.length === 1 && typeof results[0] === 'object') {
      const result = results[0];

      // Check if it's a count result
      if (Object.keys(result).length === 1) {
        const key = Object.keys(result)[0];
        const value = result[key];

        if (key.toLowerCase().includes('count')) {
          return `There are ${value} matching records.`;
        }
      }

      // Format as key-value pairs
      const pairs = Object.entries(result)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');

      return `Here's what I found: ${pairs}`;
    }

    if (results.length <= 5) {
      return `I found ${results.length} matching record${results.length !== 1 ? 's' : ''}. Would you like more details?`;
    }

    return `I found ${results.length} matching records. Here are the first few results.`;
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0.3;
    if (results.length === 1) return 0.8;
    if (results.length <= 100) return 0.9;
    return 0.85;
  }

  /**
   * Get example questions
   */
  static getExampleQuestions(): string[] {
    return [
      'Show total profit this month',
      'List all pending visas',
      'How many flights did we book?',
      'Show me hotel bookings in Paris',
      'What is our total revenue?',
      'List staff performance metrics',
      'Show invoices for client XYZ',
      'How many insurance policies are active?',
    ];
  }

  /**
   * Get available metrics
   */
  static getAvailableMetrics(): Record<string, string> {
    return {
      total_profit: 'Total profit across all invoices',
      total_revenue: 'Total customer amount collected',
      average_margin: 'Average margin per booking',
      bookings_count: 'Total number of bookings',
      clients_count: 'Total number of clients',
      pending_visas: 'Number of pending visa applications',
      finalized_invoices: 'Number of finalized invoices',
      staff_count: 'Number of staff members',
    };
  }
}
