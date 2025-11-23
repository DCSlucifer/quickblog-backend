import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuickBlog API',
      version: '1.0.0',
      description: 'Comprehensive RESTful API documentation for QuickBlog - A modern full-stack blogging platform with AI-powered content generation, comment moderation, newsletter subscriptions, and advanced blog management features.',
      contact: {
        name: 'QuickBlog Support',
        email: 'support@quickblog.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:4000',
        description: 'Alternative development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        },
      },
      schemas: {
        Blog: {
          type: 'object',
          required: ['title', 'description', 'category', 'image'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the blog',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Blog title (max 200 characters)',
              example: 'Introduction to React Hooks'
            },
            subTitle: {
              type: 'string',
              description: 'Optional subtitle for the blog',
              example: 'A comprehensive guide for beginners'
            },
            description: {
              type: 'string',
              description: 'Full blog content in HTML format',
              example: '<p>React Hooks revolutionized the way we write React components...</p>'
            },
            category: {
              type: 'string',
              enum: ['Technology', 'Startup', 'Lifestyle', 'Finance'],
              description: 'Blog category',
              example: 'Technology'
            },
            image: {
              type: 'string',
              description: 'URL of the blog cover image (optimized via ImageKit)',
              example: 'https://ik.imagekit.io/quickblog/blogs/react-hooks.webp'
            },
            isPublished: {
              type: 'boolean',
              description: 'Publication status',
              default: false,
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Blog creation timestamp',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T14:30:00.000Z'
            }
          }
        },
        Comment: {
          type: 'object',
          required: ['blog', 'name', 'content'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the comment',
              example: '507f1f77bcf86cd799439012'
            },
            blog: {
              type: 'string',
              description: 'ID of the blog this comment belongs to',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Commenter name (max 100 characters)',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Commenter email (optional)',
              example: 'john.doe@example.com'
            },
            content: {
              type: 'string',
              description: 'Comment text (max 1000 characters)',
              example: 'Great article! Very informative.'
            },
            isApproved: {
              type: 'boolean',
              description: 'Approval status (requires admin approval)',
              default: false,
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Comment creation timestamp',
              example: '2024-01-15T11:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T11:00:00.000Z'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 5
            },
            totalBlogs: {
              type: 'integer',
              description: 'Total number of blogs',
              example: 47
            },
            blogsPerPage: {
              type: 'integer',
              description: 'Number of blogs per page',
              example: 10
            }
          }
        },
        DashboardData: {
          type: 'object',
          properties: {
            blogs: {
              type: 'integer',
              description: 'Total number of blogs',
              example: 47
            },
            comments: {
              type: 'integer',
              description: 'Total number of comments',
              example: 132
            },
            drafts: {
              type: 'integer',
              description: 'Number of unpublished blogs',
              example: 8
            },
            recentBlogs: {
              type: 'array',
              description: '5 most recent blogs',
              items: {
                $ref: '#/components/schemas/Blog'
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Admin email address',
              example: 'admin@quickblog.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Admin password',
              example: 'admin123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              description: 'JWT authentication token (valid for 24 hours)',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication failed - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Invalid token'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Blog not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Blog title is required'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Blog',
        description: 'Blog management endpoints - Create, read, update, delete blogs, and manage comments'
      },
      {
        name: 'Admin',
        description: 'Admin panel endpoints - Authentication, dashboard, and content moderation'
      },
      {
        name: 'Newsletter',
        description: 'Newsletter subscription endpoints - Subscribe, unsubscribe, and manage subscribers'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default specs;