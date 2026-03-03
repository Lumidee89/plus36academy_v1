'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Save, AlertCircle, CheckCircle, X } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'
  points: number
  options?: string[]
  correctAnswer: any
  explanation?: string
  order: number
}

interface Course {
  id: string
  title: string
  status: string
}

export default function EditAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    type: 'TEST',
    courseId: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    shuffleQuestions: false,
    showResults: true,
    isPublished: true,
  })
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetchAssessment()
    fetchCourses()
  }, [assessmentId])

  async function fetchAssessment() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assessment')

      const assessmentData = data.data
      setAssessment({
        title: assessmentData.title || '',
        description: assessmentData.description || '',
        type: assessmentData.type || 'TEST',
        courseId: assessmentData.courseId || '',
        timeLimit: assessmentData.timeLimit || 30,
        passingScore: assessmentData.passingScore || 70,
        maxAttempts: assessmentData.maxAttempts || 1,
        shuffleQuestions: assessmentData.shuffleQuestions || false,
        showResults: assessmentData.showResults || true,
        isPublished: assessmentData.isPublished || false,
      })

      // Map questions
      if (assessmentData.questions) {
        setQuestions(assessmentData.questions.map((q: any, index: number) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options || (q.type === 'MULTIPLE_CHOICE' ? ['', ''] : undefined),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: index,
        })))
      }
    } catch (error: any) {
      console.error('Error fetching assessment:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCourses() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tutor/courses?status=PUBLISHED', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const responseData = await res.json()
      if (res.ok) {
        const coursesArray = responseData.data || responseData
        setCourses(Array.isArray(coursesArray) ? coursesArray : [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        options: ['', ''],
        correctAnswer: 0,
        order: questions.length,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    if (updated[qIndex].options) {
      updated[qIndex].options![oIndex] = value
      setQuestions(updated)
    }
  }

  const addOption = (qIndex: number) => {
    const updated = [...questions]
    if (!updated[qIndex].options) updated[qIndex].options = []
    updated[qIndex].options!.push('')
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options = updated[qIndex].options?.filter((_, i) => i !== oIndex)
    if (updated[qIndex].correctAnswer === oIndex) {
      updated[qIndex].correctAnswer = 0
    } else if (updated[qIndex].correctAnswer > oIndex) {
      updated[qIndex].correctAnswer = updated[qIndex].correctAnswer - 1
    }
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...assessment,
          questions: questions.map((q, index) => ({
            ...q,
            order: index,
            options: q.type === 'MULTIPLE_CHOICE' ? q.options : undefined,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update assessment')

      setSuccess('Assessment updated successfully!')
      
      // Refresh assessment data
      fetchAssessment()
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/tutor/assessments/${assessmentId}`}
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-display text-3xl font-black text-dark-300">Edit Assessment</h1>
        </div>
        {assessment.isPublished && (
          <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
            Published
          </span>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-2xl p-4">
          <CheckCircle size={18} />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assessment Details */}
        <div className="card-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Assessment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark-400 mb-1">Select Course *</label>
              <select
                value={assessment.courseId}
                onChange={(e) => setAssessment({ ...assessment, courseId: e.target.value })}
                className="input-dark w-full"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark-400 mb-1">Title</label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                className="input-dark w-full"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark-400 mb-1">Description</label>
              <textarea
                value={assessment.description}
                onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                className="input-dark w-full h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">Type</label>
              <select
                value={assessment.type}
                onChange={(e) => setAssessment({ ...assessment, type: e.target.value })}
                className="input-dark w-full"
              >
                <option value="TEST">Test</option>
                <option value="EXAM">Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">Time Limit (minutes)</label>
              <input
                type="number"
                value={assessment.timeLimit}
                onChange={(e) => setAssessment({ ...assessment, timeLimit: parseInt(e.target.value) })}
                className="input-dark w-full"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">Passing Score (%)</label>
              <input
                type="number"
                value={assessment.passingScore}
                onChange={(e) => setAssessment({ ...assessment, passingScore: parseInt(e.target.value) })}
                className="input-dark w-full"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">Max Attempts</label>
              <input
                type="number"
                value={assessment.maxAttempts}
                onChange={(e) => setAssessment({ ...assessment, maxAttempts: parseInt(e.target.value) })}
                className="input-dark w-full"
                min="1"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assessment.shuffleQuestions}
                    onChange={(e) => setAssessment({ ...assessment, shuffleQuestions: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-700"
                  />
                  <span className="text-sm text-dark-300">Shuffle Questions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assessment.showResults}
                    onChange={(e) => setAssessment({ ...assessment, showResults: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-700"
                  />
                  <span className="text-sm text-dark-300">Show Results Immediately</span>
                </label>
                <label className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    checked={assessment.isPublished}
                    onChange={(e) => setAssessment({ ...assessment, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-700"
                  />
                  <span className="text-sm text-dark-300">Published</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark-300">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn-secondary text-sm py-2 px-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-dark-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-dark-300">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder="Question text"
                      className="input-dark w-full"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                      className="input-dark w-full"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="ESSAY">Essay</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                      placeholder="Points"
                      className="input-dark w-full"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {question.type === 'MULTIPLE_CHOICE' && (
                  <div className="mt-3 space-y-2">
                    <label className="text-sm text-dark-400">Options</label>
                    {question.options?.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="input-dark flex-1"
                          required
                        />
                        {question.options!.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-brand-400 hover:text-brand-300 mt-2"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                {/* True/False */}
                {question.type === 'TRUE_FALSE' && (
                  <div className="mt-3">
                    <label className="text-sm text-dark-400 block mb-2">Correct Answer</label>
                    <select
                      value={question.correctAnswer?.toString()}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value === 'true')}
                      className="input-dark w-full"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                )}

                {/* Short Answer / Essay */}
                {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
                  <div className="mt-3">
                    <label className="text-sm text-dark-400 block mb-2">Correct Answer</label>
                    {question.type === 'SHORT_ANSWER' ? (
                      <input
                        type="text"
                        value={question.correctAnswer || ''}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        className="input-dark w-full"
                        placeholder="Expected answer"
                      />
                    ) : (
                      <textarea
                        value={question.correctAnswer || ''}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        className="input-dark w-full h-24"
                        placeholder="Model answer (for grading reference)"
                      />
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="mt-3">
                  <label className="text-sm text-dark-400 block mb-2">Explanation (Optional)</label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    className="input-dark w-full"
                    placeholder="Explain why this answer is correct"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl p-3 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href={`/dashboard/tutor/assessments/${assessmentId}`}
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}