import type { Request, Response } from 'express';
import type { ApiSuccessResponse } from '@repo/shared';

export interface HealthCheckData {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    const data: HealthCheckData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    const response: ApiSuccessResponse<HealthCheckData> = {
      success: true,
      data,
    };

    res.status(200).json(response);
  }
}
