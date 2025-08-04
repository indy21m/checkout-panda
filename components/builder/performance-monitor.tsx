'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Gauge,
  BarChart3,
  RefreshCw,
  Download,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  score: 'good' | 'needs-improvement' | 'poor'
  description: string
  target: number
}

interface PerformanceData {
  metrics: {
    loadTime: PerformanceMetric
    renderTime: PerformanceMetric
    bundleSize: PerformanceMetric
    componentCount: PerformanceMetric
    memoryUsage: PerformanceMetric
  }
  history: Array<{
    timestamp: number
    loadTime: number
    renderTime: number
  }>
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    metrics: {
      loadTime: {
        name: 'Page Load Time',
        value: 1.2,
        unit: 's',
        score: 'good',
        description: 'Time to interactive',
        target: 2.5,
      },
      renderTime: {
        name: 'Render Time',
        value: 45,
        unit: 'ms',
        score: 'good',
        description: 'Component render duration',
        target: 100,
      },
      bundleSize: {
        name: 'Bundle Size',
        value: 245,
        unit: 'KB',
        score: 'needs-improvement',
        description: 'JavaScript bundle size',
        target: 200,
      },
      componentCount: {
        name: 'Components',
        value: 42,
        unit: '',
        score: 'good',
        description: 'Active components on page',
        target: 50,
      },
      memoryUsage: {
        name: 'Memory Usage',
        value: 32,
        unit: 'MB',
        score: 'good',
        description: 'Current memory footprint',
        target: 50,
      },
    },
    history: [],
  })
  

  // Simulate performance monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const updateMetrics = () => {
      setPerformanceData((prev) => {
        const newLoadTime = Math.max(0.8, prev.metrics.loadTime.value + (Math.random() - 0.5) * 0.2)
        const newRenderTime = Math.max(20, prev.metrics.renderTime.value + (Math.random() - 0.5) * 10)
        
        return {
          metrics: {
            ...prev.metrics,
            loadTime: {
              ...prev.metrics.loadTime,
              value: newLoadTime,
              score: newLoadTime < 2.5 ? 'good' : newLoadTime < 4 ? 'needs-improvement' : 'poor',
            },
            renderTime: {
              ...prev.metrics.renderTime,
              value: newRenderTime,
              score: newRenderTime < 100 ? 'good' : newRenderTime < 200 ? 'needs-improvement' : 'poor',
            },
          },
          history: [
            ...prev.history.slice(-29),
            {
              timestamp: Date.now(),
              loadTime: newLoadTime,
              renderTime: newRenderTime,
            },
          ],
        }
      })
    }

    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [isMonitoring])

  const getScoreColor = (score: PerformanceMetric['score']) => {
    switch (score) {
      case 'good':
        return 'text-green-600 bg-green-100'
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100'
      case 'poor':
        return 'text-red-600 bg-red-100'
    }
  }

  const getScoreIcon = (score: PerformanceMetric['score']) => {
    switch (score) {
      case 'good':
        return CheckCircle
      case 'needs-improvement':
        return AlertTriangle
      case 'poor':
        return AlertTriangle
    }
  }

  const calculateOverallScore = () => {
    const scores = Object.values(performanceData.metrics)
    const goodCount = scores.filter((m) => m.score === 'good').length
    const percentage = (goodCount / scores.length) * 100
    return Math.round(percentage)
  }

  const overallScore = calculateOverallScore()

  return (
    <>
      {/* Floating Performance Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all",
                overallScore >= 80
                  ? "bg-green-500 text-white"
                  : overallScore >= 60
                  ? "bg-yellow-500 text-white"
                  : "bg-red-500 text-white"
              )}
            >
              <Activity className="h-4 w-4" />
              <span className="font-semibold">{overallScore}%</span>
              {isMonitoring && (
                <motion.div
                  className="h-2 w-2 bg-white rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Performance Score</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Performance Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Performance Monitor</h2>
                  <p className="text-sm text-gray-500">Real-time metrics</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Overall Score */}
            <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Overall Performance</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMonitoring(!isMonitoring)}
                >
                  {isMonitoring ? (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Monitoring
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Paused
                    </>
                  )}
                </Button>
              </div>
              
              <div className="relative h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${overallScore * 3.77} 377`}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-500",
                      overallScore >= 80
                        ? "text-green-500"
                        : overallScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    )}
                    initial={{ strokeDasharray: "0 377" }}
                    animate={{ strokeDasharray: `${overallScore * 3.77} 377` }}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
                <div className="text-center">
                  <div className="text-3xl font-bold">{overallScore}%</div>
                  <div className="text-sm text-gray-500">Performance Score</div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {Object.entries(performanceData.metrics).map(([key, metric]) => {
                const Icon = getScoreIcon(metric.score)
                const progress = (metric.value / metric.target) * 100
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          getScoreColor(metric.score)
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-xs text-gray-500">{metric.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {metric.value}{metric.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Target: {metric.target}{metric.unit}
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(100, progress)} 
                      className="h-2"
                    />
                  </motion.div>
                )
              })}

              {/* Performance Tips */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  Performance Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    Optimize images using next/image
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    Lazy load components below the fold
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    Minimize bundle size with code splitting
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Report
                </Button>
                <Button variant="secondary" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}