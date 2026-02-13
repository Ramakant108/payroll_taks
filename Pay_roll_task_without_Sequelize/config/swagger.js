const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description: 'API for job portal - auth, jobs, recruiters, candidates, and admin.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from login or register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            fname: { type: 'string', example: 'John' },
            lname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role_id: { type: 'integer', example: 1 },
            deleted: { type: 'boolean', example: false },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Software Engineer' },
            description: { type: 'string', example: 'Job description' },
            recruiterId: { type: 'integer', example: 2 },
            deleted: { type: 'boolean', example: false },
          },
        },
        RegisterBody: {
          type: 'object',
          required: ['fname', 'lname', 'email', 'password', 'roleName'],
          properties: {
            fname: { type: 'string', example: 'John' },
            lname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'secret123' },
            roleName: { type: 'string', example: 'candidate', description: 'candidate or recruiter' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        SendOtpBody: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
        ResetPasswordBody: {
          type: 'object',
          required: ['email', 'newPassword', 'otp'],
          properties: {
            email: { type: 'string', format: 'email' },
            newPassword: { type: 'string', format: 'password' },
            otp: { type: 'string', example: '123456' },
          },
        },
        AddJobBody: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: { type: 'string', example: 'Backend Developer' },
            description: { type: 'string', example: 'Job description here' },
          },
        },
        AddRecruiterBody: {
          type: 'object',
          required: ['fname', 'lname', 'email', 'password', 'role_id'],
          properties: {
            fname: { type: 'string' },
            lname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            role_id: { type: 'integer', example: 2 },
          },
        },
        UpdateRecruiterBody: {
          type: 'object',
          properties: {
            fname: { type: 'string' },
            lname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        PaginationQuery: {
          type: 'object',
          properties: {
            pageNo: { type: 'integer', example: 1, description: 'Page number' },
            perPage: { type: 'integer', example: 10, description: 'Items per page' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registration, login, OTP, reset password' },
      { name: 'Job', description: 'Job listing and posting' },
      { name: 'Recruiter', description: 'Recruiter job and candidate views' },
      { name: 'Candidate', description: 'Apply and view applied jobs' },
      { name: 'Admin', description: 'Admin dashboard and management' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterBody' },
              },
            },
          },
          responses: {
            200: { description: 'User created successfully', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, data: { type: 'object' } } } } } },
            400: { description: 'Validation or business error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/login': {
        get: {
          tags: ['Auth'],
          summary: 'Login (GET with query params)',
          parameters: [
            { name: 'email', in: 'query', required: true, schema: { type: 'string', format: 'email' } },
            { name: 'password', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, data: { type: 'object', properties: { token: { type: 'string' }, data: { $ref: '#/components/schemas/User' } } } } } } } },
            400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/sendotp': {
        get: {
          tags: ['Auth'],
          summary: 'Send OTP for password reset',
          parameters: [
            { name: 'email', in: 'query', required: true, schema: { type: 'string', format: 'email' } },
          ],
          responses: {
            200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object' } } } },
            400: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/resetPass': {
        put: {
          tags: ['Auth'],
          summary: 'Reset password with OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordBody' },
              },
            },
          },
          responses: {
            200: { description: 'Password reset successfully' },
            400: { description: 'Invalid OTP or user', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/job': {
        post: {
          tags: ['Job'],
          summary: 'Post a new job (recruiter)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddJobBody' },
              },
            },
          },
          responses: {
            201: { description: 'Job posted successfully', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Job' } } } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/jobs': {
        get: {
          tags: ['Job'],
          summary: 'List jobs with pagination and optional search',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'pageNo', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in title and description' },
          ],
          responses: {
            200: { description: 'List of jobs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/recruiter/getjobs': {
        get: {
          tags: ['Recruiter'],
          summary: 'Get jobs posted by the logged-in recruiter',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'pageNo', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Object with count and rows of jobs', content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, rows: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/recruiter/getcandidate/{id}': {
        get: {
          tags: ['Recruiter'],
          summary: 'Get candidates for a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Job ID' },
            { name: 'pageNo', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Object with count and rows (job with candidates)', content: { 'application/json': { schema: { type: 'object' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/candidate/apply/{id}': {
        post: {
          tags: ['Candidate'],
          summary: 'Apply to a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Job ID' },
          ],
          responses: {
            201: { description: 'Applied successfully', content: { 'application/json': { schema: { type: 'object' } } } },
            400: { description: 'Already applied or job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/candidate/getjob': {
        get: {
          tags: ['Candidate'],
          summary: 'Get jobs applied by the logged-in candidate',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'pageNo', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Object with count and rows of applied jobs', content: { 'application/json': { schema: { type: 'object' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/get-all': {
        get: {
          tags: ['Admin'],
          summary: 'Get all candidates, recruiters, and jobs (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'pageNo', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Object with candidate, recruiter, jobs (each with count and rows)', content: { 'application/json': { schema: { type: 'object' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/recruiter': {
        post: {
          tags: ['Admin'],
          summary: 'Add a recruiter',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddRecruiterBody' },
              },
            },
          },
          responses: {
            200: { description: 'Recruiter created', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'User already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          tags: ['Admin'],
          summary: 'Update recruiter(s)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateRecruiterBody' },
              },
            },
          },
          responses: {
            200: { description: 'Updated successfully' },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/candidate/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Soft delete a user (candidate/recruiter)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'User ID' },
          ],
          responses: {
            200: { description: 'Deleted successfully' },
            400: { description: 'User not present', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/job/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Soft delete a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Job ID' },
          ],
          responses: {
            200: { description: 'Deleted successfully' },
            400: { description: 'Job not present', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/candidate-job/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get jobs applied by a candidate (by candidate user id)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Candidate user ID' },
          ],
          responses: {
            200: { description: 'Candidate with applied jobs', content: { 'application/json': { schema: { type: 'object' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/export': {
        get: {
          tags: ['Admin'],
          summary: 'Export jobs, candidates, recruiters to Excel',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Excel file generated and sent; response includes candidateData, recruiterData, jobData' },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
