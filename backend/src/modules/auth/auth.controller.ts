import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '@/middleware';
import { ValidatedRequest } from '@/middleware/validation';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';
import { Logger } from '@/shared/utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: ValidatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.authService.register(req.validated);
      return res.status(201).json(ApiResponseBuilder.success(user, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async login(req: ValidatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.validated);
      return res.status(200).json(
        ApiResponseBuilder.success(result, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await this.authService.getUserById(req.user!.id);
      return res.status(200).json(ApiResponseBuilder.success(user));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await this.authService.updateUser(
        req.user!.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(user, 'Profile updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await this.authService.getAllUsers(page, limit);
      const response = PaginationHelper.getPaginationResponse(
        users,
        total,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        ...response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await this.authService.updateUser(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(user, 'User updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.authService.deleteUser(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'User deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
