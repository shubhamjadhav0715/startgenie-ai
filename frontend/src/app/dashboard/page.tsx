'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { blueprintAPI, authAPI } from '@/lib/api'
import { Plus, FileText, Trash2, Eye, Download, LogOut, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [blueprints, setBlueprints] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newIdea, setNewIdea] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userRes, blueprintsRes] = await Promise.all([
        authAPI.getCurrentUser(),
        blueprintAPI.getAll(0, 20)
      ])
      setUser(userRes)
      setBlueprints(blueprintsRes)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
  }

  const handleGenerateBlueprint = async () => {
    if (!newIdea.trim()) return
    
    setGenerating(true)
    try {
      const blueprint = await blueprintAPI.generate(newIdea)
      setBlueprints([blueprint, ...blueprints])
      setShowNewModal(false)
      setNewIdea('')
      router.push(`/blueprint/${blueprint._id}`)
    } catch (error) {
      alert('Failed to generate blueprint')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blueprint?')) return
    
    try {
      await blueprintAPI.delete(id)
      setBlueprints(blueprints.filter(b => b._id !== id))
    } catch (error) {
      alert('Failed to delete blueprint')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold gradient-text">StartGenie AI</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.username}</span>
            </span>
            <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Blueprints</p>
                <p className="text-3xl font-bold text-gray-900">{blueprints.length}</p>
              </div>
              <FileText className="w-12 h-12 text-primary-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {blueprints.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <Sparkles className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {blueprints.filter(b => b.status === 'generating').length}
                </p>
              </div>
              <div className="spinner w-12 h-12 opacity-20" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Blueprints</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Blueprint
          </button>
        </div>

        {/* Blueprints Grid */}
        {blueprints.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blueprints yet</h3>
            <p className="text-gray-600 mb-6">Create your first startup blueprint to get started</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Blueprint
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint) => (
              <div key={blueprint._id} className="bg-white rounded-xl p-6 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {blueprint.startup_idea}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      blueprint.status === 'completed' ? 'bg-green-100 text-green-800' :
                      blueprint.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {blueprint.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Created {new Date(blueprint.created_at).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/blueprint/${blueprint._id}`}
                    className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(blueprint._id)}
                    className="btn-secondary p-3"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Blueprint Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Blueprint
            </h2>
            <p className="text-gray-600 mb-6">
              Describe your startup idea in detail. The more information you provide, the better the blueprint.
            </p>
            
            <textarea
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Example: A mobile app that connects local farmers directly with consumers in tier-2 cities, eliminating middlemen and ensuring fresh produce delivery within 24 hours..."
              className="input-field min-h-[200px] mb-6"
              disabled={generating}
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateBlueprint}
                disabled={generating || !newIdea.trim()}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="spinner w-5 h-5 border-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Blueprint
                  </>
                )}
              </button>
              <button
                onClick={() => setShowNewModal(false)}
                disabled={generating}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
