'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

export default function CreateAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')

  const [loading, setLoading] = useState(false)
  const [fetchingCourses, setFetchingCourses] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdAssessment, setCreatedAssessment] = useState<any>(null)
  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    type: 'TEST',
    courseId: courseId || '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1,
    shuffleQuestions: false,
    showResults: true,
  })
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: '',
      type: 'MULTIPLE_CHOICE',
      points: 1,
      options: ['', ''],
      correctAnswer: 0,
      order: 0,
    },
  ])

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setFetchingCourses(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tutor/courses?status=PUBLISHED', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const responseData = await res.json()
      console.log("Courses received:", responseData)
      
      if (res.ok) {
        const coursesArray = responseData.data || responseData
        setCourses(Array.isArray(coursesArray) ? coursesArray : [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setFetchingCourses(false)
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
    setLoading(true)
    setError('')

    if (!assessment.courseId) {
      setError('Please select a course')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tutor/assessments', {
        method: 'POST',
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
      if (!res.ok) throw new Error(data.error || 'Failed to create assessment')

      setCreatedAssessment(data.data)
      setShowSuccessModal(true)
      
      // Reset form
      setAssessment({
        title: '',
        description: '',
        type: 'TEST',
        courseId: courseId || '',
        timeLimit: 30,
        passingScore: 70,
        maxAttempts: 1,
        shuffleQuestions: false,
        showResults: true,
      })
      setQuestions([
        {
          id: '1',
          text: '',
          type: 'MULTIPLE_CHOICE',
          points: 1,
          options: ['', ''],
          correctAnswer: 0,
          order: 0,
        },
      ])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    router.push('/dashboard/tutor/assessments')
  }

  const handleViewAssessment = () => {
    setShowSuccessModal(false)
    if (createdAssessment) {
      router.push(`/dashboard/tutor/assessments/${createdAssessment.id}`)
    }
  }

  const handleCreateAnother = () => {
    setShowSuccessModal(false)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/tutor/assessments"
              className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="font-display text-3xl font-black text-dark-300">Create New Assessment</h1>
          </div>
        </div>

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
                  disabled={fetchingCourses}
                >
                  <option value="">
                    {fetchingCourses ? 'Loading courses...' : 'Select a course'}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {!fetchingCourses && courses.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    No published courses found. Please publish a course first.
                  </p>
                )}
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
              href="/dashboard/tutor/assessments"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || courses.length === 0}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Creating...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 rounded-2xl max-w-md w-full p-6 border border-dark-800 shadow-2xl animate-scale-in">
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-dark-800 text-dark-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-dark-300 mb-2">Assessment Published!</h3>
              <p className="text-dark-400">
                Your {createdAssessment?.type.toLowerCase()} has been published and is now visible to students.
              </p>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-dark-300 font-medium mb-1">{createdAssessment?.title}</p>
              <p className="text-xs text-dark-400">{createdAssessment?.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-dark-500">
                <span>{createdAssessment?._count?.questions || questions.length} questions</span>
                <span>•</span>
                <span>{createdAssessment?.type}</span>
                <span>•</span>
                <span className="text-green-500">Published</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleViewAssessment}
                className="btn-primary w-full py-3"
              >
                View Assessment
              </button>
              <button
                onClick={handleCreateAnother}
                className="btn-secondary w-full py-3"
              >
                Create Another
              </button>
              <button
                onClick={handleCloseModal}
                className="btn-ghost w-full py-3"
              >
                Go to Assessments
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}