import request from 'supertest';
import express from 'express';
import { 
  generalRateLimit, 
  authRateLimit, 
  paymentRateLimit,
  securityMiddleware 
} from '../middlewares/rate-limit.middleware';
import { securityMiddleware as security } from '../middlewares/security.middleware';

describe('Security Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      app.use(generalRateLimit);
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should block requests exceeding auth rate limit', async () => {
      app.use(authRateLimit);
      app.post('/login', (req, res) => res.json({ success: true }));

      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        await request(app).post('/login').send({ email: 'test@test.com' });
      }

      // This should be blocked
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@test.com' })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('AUTH_RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Input Sanitization', () => {
    beforeEach(() => {
      app.use(security);
      app.post('/test', (req, res) => res.json({ body: req.body }));
    });

    it('should sanitize script tags from input', async () => {
      const maliciousInput = {
        message: '<script>alert("xss")</script>Hello World'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.body.message).toBe('Hello World');
      expect(response.body.body.message).not.toContain('<script>');
    });

    it('should sanitize javascript protocol from input', async () => {
      const maliciousInput = {
        url: 'javascript:alert("xss")'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.body.url).toBe('alert("xss")');
      expect(response.body.body.url).not.toContain('javascript:');
    });

    it('should handle nested objects and arrays', async () => {
      const maliciousInput = {
        user: {
          name: '<script>alert("xss")</script>John',
          tags: ['<script>alert("xss")</script>tag1', 'tag2']
        }
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.body.user.name).toBe('John');
      expect(response.body.body.user.tags[0]).toBe('tag1');
    });
  });

  describe('SQL Injection Protection', () => {
    beforeEach(() => {
      app.use(security);
      app.post('/test', (req, res) => res.json({ success: true }));
    });

    it('should block SQL injection attempts', async () => {
      const sqlInjectionAttempts = [
        { query: "'; DROP TABLE users; --" },
        { query: "1' OR '1'='1" },
        { query: "UNION SELECT * FROM users" },
        { query: "'; INSERT INTO users VALUES (1, 'hacker'); --" }
      ];

      for (const attempt of sqlInjectionAttempts) {
        const response = await request(app)
          .post('/test')
          .send(attempt)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('INVALID_INPUT');
      }
    });

    it('should allow legitimate queries', async () => {
      const legitimateInput = {
        search: 'cotton fabric',
        category: 'textiles',
        price: '100-500'
      };

      const response = await request(app)
        .post('/test')
        .send(legitimateInput)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('XSS Protection', () => {
    beforeEach(() => {
      app.use(security);
      app.post('/test', (req, res) => res.json({ success: true }));
    });

    it('should block XSS attempts', async () => {
      const xssAttempts = [
        { content: '<script>alert("xss")</script>' },
        { content: '<iframe src="javascript:alert(\'xss\')"></iframe>' },
        { content: '<object data="javascript:alert(\'xss\')"></object>' },
        { content: '<embed src="javascript:alert(\'xss\')">' },
        { content: 'javascript:alert("xss")' },
        { content: 'vbscript:alert("xss")' },
        { content: '<div onclick="alert(\'xss\')">Click me</div>' }
      ];

      for (const attempt of xssAttempts) {
        const response = await request(app)
          .post('/test')
          .send(attempt)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('XSS_DETECTED');
      }
    });
  });

  describe('Request Size Validation', () => {
    beforeEach(() => {
      app.use(security);
      app.post('/test', (req, res) => res.json({ success: true }));
    });

    it('should block oversized requests', async () => {
      // Create a large payload
      const largePayload = {
        data: 'x'.repeat(11 * 1024 * 1024) // 11MB
      };

      const response = await request(app)
        .post('/test')
        .send(largePayload)
        .expect(413);

      expect(response.body.error).toBe('REQUEST_TOO_LARGE');
    });
  });

  describe('Header Validation', () => {
    beforeEach(() => {
      app.use(security);
      app.get('/test', (req, res) => res.json({ success: true }));
    });

    it('should reject requests without User-Agent', async () => {
      const response = await request(app)
        .get('/test')
        .set('User-Agent', '')
        .expect(400);

      expect(response.body.error).toBe('INVALID_USER_AGENT');
    });

    it('should reject requests with overly long User-Agent', async () => {
      const longUserAgent = 'x'.repeat(501);
      
      const response = await request(app)
        .get('/test')
        .set('User-Agent', longUserAgent)
        .expect(400);

      expect(response.body.error).toBe('INVALID_USER_AGENT');
    });

    it('should accept valid User-Agent', async () => {
      const response = await request(app)
        .get('/test')
        .set('User-Agent', 'Mozilla/5.0 (Test Browser)')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('File Upload Security', () => {
    beforeEach(() => {
      app.use(security);
      app.post('/upload', (req, res) => res.json({ success: true }));
    });

    it('should block dangerous file types', async () => {
      // Mock file object
      const dangerousFile = {
        mimetype: 'application/javascript',
        size: 1024,
        originalname: 'malicious.js'
      };

      // Simulate file upload by adding to request
      app.use((req, res, next) => {
        req.file = dangerousFile as any;
        next();
      });

      const response = await request(app)
        .post('/upload')
        .expect(400);

      expect(response.body.error).toBe('INVALID_FILE_TYPE');
    });

    it('should block oversized files', async () => {
      const oversizedFile = {
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
        originalname: 'large.jpg'
      };

      app.use((req, res, next) => {
        req.file = oversizedFile as any;
        next();
      });

      const response = await request(app)
        .post('/upload')
        .expect(400);

      expect(response.body.error).toBe('FILE_TOO_LARGE');
    });

    it('should block files with suspicious names', async () => {
      const suspiciousFile = {
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: '../../../etc/passwd.jpg'
      };

      app.use((req, res, next) => {
        req.file = suspiciousFile as any;
        next();
      });

      const response = await request(app)
        .post('/upload')
        .expect(400);

      expect(response.body.error).toBe('INVALID_FILENAME');
    });

    it('should allow valid files', async () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'photo.jpg'
      };

      app.use((req, res, next) => {
        req.file = validFile as any;
        next();
      });

      const response = await request(app)
        .post('/upload')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});