import { Request, Response, NextFunction } from 'express';
export declare const csrfProtection: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const generateCSRFToken: () => string;
export declare const csrfTokenHandler: (_req: Request, res: Response) => void;
//# sourceMappingURL=csrfProtection.d.ts.map