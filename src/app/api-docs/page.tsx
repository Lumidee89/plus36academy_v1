'use client'
import { useState } from 'react'
import { Copy, CheckCircle, ChevronDown, ChevronRight, Code, Lock, Globe } from 'lucide-react'

const API_BASE = 'https://your-domain.com/api'

const ENDPOINTS = [
  {
    category: 'Authentication',
    icon: '🔐',
    endpoints: [
      {
        method: 'POST',
        path: '/auth/register',
        title: 'Register User',
        description: 'Create a new student or tutor account',
        auth: false,
        body: {
          name: 'string (required)',
          email: 'string (required)',
          password: 'string (required, min 8 chars)',
          role: '"STUDENT" | "TUTOR" (default: STUDENT)',
          phone: 'string (optional)',
        },
        response: {
          success: true,
          data: {
            user: { id: 'string', name: 'string', email: 'string', role: 'string' },
            token: 'JWT token string',
          },
        },
      },
      {
        method: 'POST',
        path: '/auth/login',
        title: 'Login',
        description: 'Authenticate and get JWT token',
        auth: false,
        body: { email: 'string', password: 'string' },
        response: {
          success: true,
          data: {
            user: { id: 'string', name: 'string', email: 'string', role: 'string' },
            token: 'JWT token string',
          },
        },
      },
      {
        method: 'GET',
        path: '/auth/me',
        title: 'Get Current User',
        description: 'Get authenticated user profile',
        auth: true,
        body: null,
        response: { success: true, data: { id: 'string', name: 'string', email: 'string', role: 'string', bio: 'string | null' } },
      },
      {
        method: 'PUT',
        path: '/auth/me',
        title: 'Update Profile',
        description: 'Update authenticated user profile',
        auth: true,
        body: { name: 'string (optional)', bio: 'string (optional)', phone: 'string (optional)', avatar: 'string URL (optional)' },
        response: { success: true, data: { updated: 'user object' } },
      },
    ],
  },
  {
    category: 'Courses',
    icon: '📚',
    endpoints: [
      {
        method: 'GET',
        path: '/courses',
        title: 'List Courses',
        description: 'Get paginated list of courses with filters',
        auth: false,
        body: null,
        query: {
          page: 'number (default: 1)',
          limit: 'number (default: 10, max: 100)',
          search: 'string (optional)',
          category: 'string (optional, category ID)',
          level: 'string (optional)',
          status: '"PUBLISHED" | "DRAFT" (default: PUBLISHED)',
        },
        response: {
          success: true,
          data: ['array of course objects'],
          meta: { total: 'number', page: 'number', limit: 'number', totalPages: 'number' },
        },
      },
      {
        method: 'GET',
        path: '/courses/:id',
        title: 'Get Course',
        description: 'Get full course details with modules and materials',
        auth: false,
        body: null,
        response: {
          success: true,
          data: { id: 'string', title: 'string', modules: 'array', tutor: 'object', reviews: 'array', isEnrolled: 'boolean' },
        },
      },
      {
        method: 'POST',
        path: '/courses',
        title: 'Create Course',
        description: 'Create a new course (TUTOR or ADMIN only)',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: {
          title: 'string (required)',
          description: 'string (required)',
          price: 'number (required)',
          currency: 'string (default: NGN)',
          level: '"Beginner" | "Intermediate" | "Advanced"',
          categoryId: 'string (optional)',
          requirements: 'string[] (optional)',
          objectives: 'string[] (optional)',
          tags: 'string[] (optional)',
          thumbnail: 'string URL (optional)',
          isFreemium: 'boolean (default: false)',
        },
        response: { success: true, data: { course: 'object' }, message: 'Course created successfully' },
      },
      {
        method: 'PUT',
        path: '/courses/:id',
        title: 'Update Course',
        description: 'Update course details (owner tutor or admin)',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: { any: 'course field to update' },
        response: { success: true, data: { updated: 'course object' } },
      },
    ],
  },
  {
    category: 'Materials',
    icon: '📁',
    endpoints: [
      {
        method: 'POST',
        path: '/materials',
        title: 'Add Material',
        description: 'Add a material to a module (after uploading file)',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: {
          title: 'string (required)',
          type: '"PDF" | "IMAGE" | "TEXT" | "VIDEO" | "VIDEO_LINK" (required)',
          moduleId: 'string (required)',
          order: 'number (required)',
          fileUrl: 'string URL (for PDF, IMAGE, VIDEO types)',
          videoUrl: 'string URL (for VIDEO_LINK type)',
          content: 'string (for TEXT type)',
          isFree: 'boolean (default: false)',
          description: 'string (optional)',
          duration: 'number seconds (optional)',
          fileSize: 'number bytes (optional)',
        },
        response: { success: true, data: { material: 'object' } },
      },
      {
        method: 'POST',
        path: '/materials/upload',
        title: 'Upload File (Local Storage)',
        description: 'Upload a file to the server. Files are saved to /public/uploads/ and served as static assets.',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: {
          'Content-Type': 'multipart/form-data  ← IMPORTANT (not JSON)',
          file: 'File binary (required)',
          category: '"PDF" | "IMAGE" | "VIDEO" (optional, auto-detected from MIME type)',
        },
        response: {
          success: true,
          data: {
            url: '/uploads/videos/abc123-uuid.mp4',
            filename: 'abc123-uuid.mp4',
            originalName: 'my-lecture.mp4',
            mimeType: 'video/mp4',
            size: 104857600,
            sizeMB: 100,
            category: 'videos',
          },
        },
      },
      {
        method: 'PUT',
        path: '/materials/:id',
        title: 'Update Material',
        description: 'Update material metadata',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: { any: 'material field to update' },
        response: { success: true, data: { updated: 'material object' } },
      },
      {
        method: 'DELETE',
        path: '/materials/:id',
        title: 'Delete Material',
        description: 'Delete a material from a module',
        auth: true,
        role: 'TUTOR | ADMIN',
        body: null,
        response: { success: true, message: 'Material deleted' },
      },
    ],
  },
  {
    category: 'Enrollments & Payments',
    icon: '💳',
    endpoints: [
      {
        method: 'GET',
        path: '/enrollments',
        title: 'Get Enrollments',
        description: "Get user's enrolled courses",
        auth: true,
        body: null,
        query: { userId: 'string (optional, admin only)' },
        response: { success: true, data: ['array of enrollment objects with course details'] },
      },
      {
        method: 'POST',
        path: '/payments',
        title: 'Initiate Payment',
        description: 'Enroll in course (free) or initiate payment',
        auth: true,
        body: {
          courseId: 'string (required)',
          provider: '"paystack" | "stripe" (default: paystack)',
        },
        response: {
          success: true,
          data: {
            paymentId: 'string',
            checkoutUrl: 'string (redirect here for payment)',
            isFree: 'boolean (if free course, auto-enrolled)',
          },
        },
      },
      {
        method: 'GET',
        path: '/payments/verify',
        title: 'Verify Payment',
        description: 'Check payment status by reference',
        auth: false,
        query: { reference: 'string (payment ID or provider reference)' },
        body: null,
        response: { success: true, data: { status: '"PENDING" | "COMPLETED" | "FAILED"', payment: 'object' } },
      },
      {
        method: 'POST',
        path: '/payments/verify',
        title: 'Payment Webhook',
        description: 'Webhook endpoint for payment providers (Paystack/Stripe)',
        auth: false,
        body: { event: 'provider event data' },
        response: { success: true },
      },
    ],
  },
  {
    category: 'Users (Admin)',
    icon: '👥',
    endpoints: [
      {
        method: 'GET',
        path: '/users',
        title: 'List All Users',
        description: 'Get paginated users list (ADMIN only)',
        auth: true,
        role: 'ADMIN',
        query: { page: 'number', limit: 'number', role: '"STUDENT" | "TUTOR" | "ADMIN"', search: 'string' },
        body: null,
        response: { success: true, data: ['array of user objects'], meta: { total: 'number', totalPages: 'number' } },
      },
      {
        method: 'GET',
        path: '/users/stats',
        title: 'Get Stats',
        description: 'Role-aware dashboard statistics',
        auth: true,
        body: null,
        response: {
          success: true,
          data: {
            admin: '{ totalStudents, totalTutors, totalCourses, totalRevenue, activeEnrollments }',
            tutor: '{ totalCourses, publishedCourses, totalStudents, totalRevenue }',
            student: '{ enrolled, completed, inProgress }',
          },
        },
      },
    ],
  },
]

const METHOD_COLOR = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  POST: 'bg-green-500/10 text-green-400 border-green-500/30',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-dark-700 transition-colors">
      {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} className="text-dark-400" />}
    </button>
  )
}

function EndpointCard({ endpoint }: { endpoint: any }) {
  const [open, setOpen] = useState(false)
  const fullPath = `${API_BASE}${endpoint.path}`

  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-dark-800/50 transition-colors"
        onClick={() => setOpen(!open)}>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border font-mono flex-shrink-0 ${
          METHOD_COLOR[endpoint.method as keyof typeof METHOD_COLOR]
        }`}>
          {endpoint.method}
        </span>
        <code className="text-dark-300 font-mono text-sm flex-1">{endpoint.path}</code>
        {endpoint.auth && <Lock size={14} className="text-brand-400 flex-shrink-0" />}
        {!endpoint.auth && <Globe size={14} className="text-dark-500 flex-shrink-0" />}
        {open ? <ChevronDown size={16} className="text-dark-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-dark-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-dark-800 p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1">{endpoint.title}</h4>
              <p className="text-dark-400 text-sm">{endpoint.description}</p>
            </div>
            {endpoint.role && (
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-lg flex-shrink-0">
                {endpoint.role}
              </span>
            )}
          </div>

          {/* Full URL */}
          <div className="bg-dark-900 rounded-xl p-3 flex items-center justify-between">
            <code className="text-brand-400 text-xs font-mono">{fullPath}</code>
            <CopyButton text={fullPath} />
          </div>

          {/* Query params */}
          {endpoint.query && (
            <div>
              <h5 className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">Query Parameters</h5>
              <div className="bg-dark-900 rounded-xl p-4 space-y-2">
                {Object.entries(endpoint.query).map(([key, val]) => (
                  <div key={key} className="flex gap-3 text-xs font-mono">
                    <span className="text-blue-400 flex-shrink-0">{key}</span>
                    <span className="text-dark-400">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request body */}
          {endpoint.body && (
            <div>
              <h5 className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">Request Body (JSON)</h5>
              <div className="bg-dark-900 rounded-xl p-4">
                <div className="flex justify-end mb-2">
                  <CopyButton text={JSON.stringify(endpoint.body, null, 2)} />
                </div>
                <pre className="text-xs text-dark-300 overflow-x-auto font-mono">
                  {JSON.stringify(endpoint.body, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <h5 className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">Response</h5>
            <div className="bg-dark-900 rounded-xl p-4">
              <div className="flex justify-end mb-2">
                <CopyButton text={JSON.stringify(endpoint.response, null, 2)} />
              </div>
              <pre className="text-xs text-dark-300 overflow-x-auto font-mono">
                {JSON.stringify(endpoint.response, null, 2)}
              </pre>
            </div>
          </div>

          {/* Auth header */}
          {endpoint.auth && (
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
              <p className="text-brand-400 text-xs font-medium mb-2">🔐 Required Header</p>
              <code className="text-dark-300 text-xs font-mono">Authorization: Bearer {'<your-jwt-token>'}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function APIDocsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <div className="border-b border-dark-800 bg-dark-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Code size={28} className="text-brand-400" />
            <div>
              <h1 className="font-display text-3xl font-black">Plus36 Academy API</h1>
              <p className="text-dark-400">RESTful API for mobile & third-party integration</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="glass rounded-xl px-4 py-2 text-sm text-dark-300">
              Base URL: <code className="text-brand-400">{API_BASE}</code>
            </div>
            <div className="glass rounded-xl px-4 py-2 text-sm text-dark-300">
              Format: <code className="text-blue-400">application/json</code>
            </div>
            <div className="glass rounded-xl px-4 py-2 text-sm text-dark-300">
              Auth: <code className="text-green-400">JWT Bearer Token</code>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick start */}
        <div className="card-dark rounded-3xl p-8 mb-10">
          <h2 className="text-white font-bold text-xl mb-4">🚀 Quick Start for Mobile Apps</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Register / Login',
                code: `POST /api/auth/register\n{\n  "name": "User Name",\n  "email": "user@email.com",\n  "password": "password123"\n}`,
              },
              {
                step: '2',
                title: 'Store Token',
                code: `// Save the token from response\nconst token = response.data.token\n\n// Use in all authenticated requests\nheaders: {\n  "Authorization": "Bearer " + token\n}`,
              },
              {
                step: '3',
                title: 'Make Requests',
                code: `// Get courses\nGET /api/courses\n\n// Enroll in course\nPOST /api/payments\n{\n  "courseId": "course_id",\n  "provider": "paystack"\n}`,
              },
            ].map((s) => (
              <div key={s.step} className="bg-dark-900 rounded-2xl p-5">
                <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white mb-3">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{s.title}</h3>
                <pre className="text-dark-400 text-xs font-mono whitespace-pre-wrap">{s.code}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* Error format */}
        <div className="card-dark rounded-3xl p-6 mb-10">
          <h2 className="text-white font-bold text-lg mb-4">Standard Response Format</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-900 rounded-xl p-4">
              <p className="text-green-400 text-xs font-medium mb-2">✓ Success</p>
              <pre className="text-xs font-mono text-dark-300">{`{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}`}</pre>
            </div>
            <div className="bg-dark-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-medium mb-2">✗ Error</p>
              <pre className="text-xs font-mono text-dark-300">{`{
  "success": false,
  "error": "Error message"
}

// HTTP Status Codes:
// 400 - Bad Request
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 409 - Conflict
// 500 - Server Error`}</pre>
            </div>
          </div>
        </div>

        {/* Endpoint groups */}
        <div className="space-y-8">
          {ENDPOINTS.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="font-display text-xl font-bold text-white">{group.category}</h2>
              </div>
              <div className="space-y-3">
                {group.endpoints.map((endpoint, i) => (
                  <EndpointCard key={i} endpoint={endpoint} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Flutter snippet */}
        <div className="mt-12 card-dark rounded-3xl p-8">
          <h2 className="text-white font-bold text-xl mb-4">📱 Flutter / Dart Example</h2>
          <div className="bg-dark-900 rounded-xl p-5 overflow-x-auto">
            <pre className="text-xs font-mono text-dark-300">{`import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class Plus36API {
  static const baseUrl = 'https://your-domain.com/api';
  static String? _token;

  // Login
  static Future<Map> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (data['success']) _token = data['data']['token'];
    return data;
  }

  // Get Courses
  static Future<List> getCourses({int page = 1, String? search}) async {
    final params = {'page': '\$page', if (search != null) 'search': search};
    final uri = Uri.parse('\$baseUrl/courses').replace(queryParameters: params);
    final res = await http.get(uri);
    return jsonDecode(res.body)['data'];
  }

  // Upload a file to local server storage
  static Future<Map> uploadFile(File file, String category) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('\$baseUrl/materials/upload'),
    );
    request.headers['Authorization'] = 'Bearer \$_token';
    request.fields['category'] = category; // PDF | IMAGE | VIDEO
    request.files.add(await http.MultipartFile.fromPath('file', file.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = jsonDecode(response.body);

    // data['data']['url'] → '/uploads/videos/uuid.mp4'
    // Full URL: 'https://your-domain.com\${data['data']['url']}'
    return data;
  }

  // Enroll in Course
  static Future<Map> enroll(String courseId) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/payments'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer \$_token',
      },
      body: jsonEncode({'courseId': courseId}),
    );
    return jsonDecode(res.body);
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
