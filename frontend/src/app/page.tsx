import Link from 'next/link'
import { Sparkles, Rocket, Target, TrendingUp, Shield, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        
        <div className="container-custom relative py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Business Planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
              Turn Your Startup Idea Into Reality
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Generate comprehensive, investor-ready business blueprints in minutes using AI and real-time data from the Indian startup ecosystem
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Get Started Free
              </Link>
              <Link href="/login" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Sign In
              </Link>
            </div>
            
            <p className="mt-6 text-primary-200 text-sm">
              No credit card required • Generate your first blueprint in 60 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by RAG technology and real-time data from government sources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 card-hover bg-white"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From idea to blueprint in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Build Your Startup?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who have turned their ideas into successful businesses
          </p>
          <Link href="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg inline-block">
            Start Building Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">StartGenie AI</h3>
              <p className="text-sm">
                AI-powered startup blueprint generator for the Indian ecosystem
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 StartGenie AI. Built by Genba Sopanrao Moze College of Engineering, Balewadi</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Advanced RAG technology analyzes your idea and generates comprehensive blueprints with real data',
  },
  {
    icon: Target,
    title: 'Market Analysis',
    description: 'Get detailed insights on target audience, market size, competitors, and industry trends',
  },
  {
    icon: TrendingUp,
    title: 'Financial Planning',
    description: 'Accurate budget estimates, funding options, and government schemes specific to your startup',
  },
  {
    icon: Shield,
    title: 'Legal Compliance',
    description: 'Complete guidance on business registration, licenses, and taxation for Indian startups',
  },
  {
    icon: Rocket,
    title: 'Go-to-Market Strategy',
    description: 'Actionable roadmap with launch plans, marketing channels, and risk mitigation',
  },
  {
    icon: Zap,
    title: 'Export Ready',
    description: 'Download your blueprint as PDF or PowerPoint for investors and stakeholders',
  },
]

const steps = [
  {
    title: 'Describe Your Idea',
    description: 'Simply tell us about your startup idea in plain English',
  },
  {
    title: 'AI Generates Blueprint',
    description: 'Our RAG engine analyzes and creates a comprehensive business plan',
  },
  {
    title: 'Refine & Export',
    description: 'Chat with AI to refine, then export as PDF or PPT',
  },
]
