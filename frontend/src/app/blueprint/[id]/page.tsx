'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { blueprintAPI } from '@/lib/api'
import { ArrowLeft, Download, FileText, TrendingUp, DollarSign, Scale, Rocket, CheckCircle, MessageSquare } from 'lucide-react'

export default function BlueprintViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [blueprint, setBlueprint] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    loadBlueprint()
  }, [params.id])

  const loadBlueprint = async () => {
    try {
      const data = await blueprintAPI.getById(params.id)
      setBlueprint(data)
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!blueprint) {
    return null
  }

  const sections = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'market', name: 'Market Analysis', icon: TrendingUp },
    { id: 'business', name: 'Business Model', icon: DollarSign },
    { id: 'swot', name: 'SWOT Analysis', icon: Scale },
    { id: 'budget', name: 'Budget', icon: DollarSign },
    { id: 'funding', name: 'Funding', icon: DollarSign },
    { id: 'legal', name: 'Legal', icon: Scale },
    { id: 'gtm', name: 'Go-to-Market', icon: Rocket },
    { id: 'roadmap', name: 'Roadmap', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Blueprint</h1>
                <p className="text-sm text-gray-600">{blueprint.startup_idea.substring(0, 60)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button className="btn-primary flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {blueprint.status === 'generating' ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="spinner mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Generating Your Blueprint...
                </h3>
                <p className="text-gray-600">
                  Our AI is analyzing your idea and creating a comprehensive business plan. This usually takes 30-60 seconds.
                </p>
              </div>
            ) : blueprint.status === 'failed' ? (
              <div className="bg-red-50 rounded-xl p-12 text-center">
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Generation Failed
                </h3>
                <p className="text-red-600 mb-4">
                  We encountered an error while generating your blueprint. Please try again.
                </p>
                <button className="btn-primary">Retry</button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Startup Overview */}
                {activeSection === 'overview' && blueprint.content?.startup_overview && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Startup Overview</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Suggested Names</h3>
                        <div className="flex flex-wrap gap-2">
                          {blueprint.content.startup_overview.suggested_names?.map((name: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Industry</h3>
                        <p className="text-gray-700">{blueprint.content.startup_overview.industry}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Problem Statement</h3>
                        <p className="text-gray-700">{blueprint.content.startup_overview.problem_statement}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Solution</h3>
                        <p className="text-gray-700">{blueprint.content.startup_overview.solution}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Unique Value Proposition</h3>
                        <p className="text-gray-700 font-medium text-primary-700">
                          {blueprint.content.startup_overview.unique_value_proposition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Analysis */}
                {activeSection === 'market' && blueprint.content?.market_analysis && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Analysis</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Target Audience</h3>
                        <p className="text-gray-700">{blueprint.content.market_analysis.target_audience}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Market Size</h3>
                          <p className="text-gray-700">{blueprint.content.market_analysis.market_size}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Market Demand</h3>
                          <p className="text-gray-700">{blueprint.content.market_analysis.market_demand}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Industry Trends</h3>
                        <ul className="space-y-2">
                          {blueprint.content.market_analysis.industry_trends?.map((trend: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{trend}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Competitors</h3>
                        <div className="space-y-3">
                          {blueprint.content.market_analysis.competitors?.map((comp: any, i: number) => (
                            <div key={i} className="p-4 border border-gray-200 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">{comp.name}</h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-green-600 font-medium">Strength:</span>
                                  <p className="text-gray-700">{comp.strength}</p>
                                </div>
                                <div>
                                  <span className="text-red-600 font-medium">Weakness:</span>
                                  <p className="text-gray-700">{comp.weakness}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SWOT Analysis */}
                {activeSection === 'swot' && blueprint.content?.swot_analysis && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">SWOT Analysis</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Strengths</h3>
                        <ul className="space-y-2">
                          {blueprint.content.swot_analysis.strengths?.map((item: string, i: number) => (
                            <li key={i} className="text-green-800">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 bg-red-50 rounded-lg">
                        <h3 className="font-semibold text-red-900 mb-3">Weaknesses</h3>
                        <ul className="space-y-2">
                          {blueprint.content.swot_analysis.weaknesses?.map((item: string, i: number) => (
                            <li key={i} className="text-red-800">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Opportunities</h3>
                        <ul className="space-y-2">
                          {blueprint.content.swot_analysis.opportunities?.map((item: string, i: number) => (
                            <li key={i} className="text-blue-800">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-3">Threats</h3>
                        <ul className="space-y-2">
                          {blueprint.content.swot_analysis.threats?.map((item: string, i: number) => (
                            <li key={i} className="text-yellow-800">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Roadmap */}
                {activeSection === 'roadmap' && blueprint.content?.action_roadmap && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Action Roadmap</h2>
                    
                    <div className="space-y-6">
                      <div className="p-6 border-l-4 border-primary-600 bg-primary-50">
                        <h3 className="font-semibold text-gray-900 mb-3">Months 0-3</h3>
                        <ul className="space-y-2">
                          {blueprint.content.action_roadmap.months_0_3?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 border-l-4 border-secondary-600 bg-secondary-50">
                        <h3 className="font-semibold text-gray-900 mb-3">Months 3-6</h3>
                        <ul className="space-y-2">
                          {blueprint.content.action_roadmap.months_3_6?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 border-l-4 border-green-600 bg-green-50">
                        <h3 className="font-semibold text-gray-900 mb-3">Months 6-12</h3>
                        <ul className="space-y-2">
                          {blueprint.content.action_roadmap.months_6_12?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
