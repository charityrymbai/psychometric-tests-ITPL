"use client"

import { useState, useEffect } from "react"

interface TemplateData {
  testTitle: string
  sections: Array<{
    sectionName: string
    sectionType: string
    isScoreSection?: boolean
    isTagSection?: boolean
    score?: number
    total?: number
    percentage?: number
    tags?: Array<{
      name: string
      count: number
    }>
  }>
  generatedDate: string
}

interface TemplateRendererProps {
  data: TemplateData
  templateVersion?: number
  onClose?: () => void
}

export function TemplateRenderer({ data, templateVersion = 0, onClose }: TemplateRendererProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateReport()
  }, [data, templateVersion])

  const generateReport = async () => {
    setLoading(true)
    
    try {
      // In a real implementation, you would fetch the template from the templates folder
      // For now, we'll use the embedded template
      const template = await getTemplate(templateVersion)
      const rendered = renderTemplate(template, data)
      setRenderedHtml(rendered)
    } catch (error) {
      console.error('Error generating report:', error)
      setRenderedHtml('<html><body><h1>Error generating report</h1></body></html>')
    } finally {
      setLoading(false)
    }
  }

  const getTemplate = async (version: number): Promise<string> => {
    // In a real implementation, you would fetch from /templates/version-${version}.html
    // For now, return the embedded template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{testTitle}} - Test Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
            color: #1e293b;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .content {
            padding: 30px;
        }
        .test-section {
            margin-bottom: 40px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
        }
        .section-header {
            background: #f8fafc;
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .section-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1e293b;
            margin: 0 0 5px 0;
        }
        .section-type {
            color: #64748b;
            font-size: 0.9rem;
        }
        .section-content {
            padding: 25px;
        }
        .score-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        .score-info {
            flex: 1;
            min-width: 300px;
        }
        .score-display {
            font-size: 3rem;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        .score-details {
            color: #64748b;
            font-size: 1.1rem;
            margin-bottom: 15px;
        }
        .percentage-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .percentage-fill {
            height: 100%;
            background: linear-gradient(90deg, #059669, #10b981);
            transition: width 0.5s ease;
        }
        .chart-container {
            flex: 0 0 300px;
            height: 300px;
            position: relative;
        }
        .tags-section {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }
        .tags-list {
            flex: 1;
            min-width: 300px;
        }
        .tag-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .tag-item:last-child {
            border-bottom: none;
        }
        .tag-name {
            font-weight: 500;
            color: #374151;
        }
        .tag-count {
            font-weight: bold;
            color: #6366f1;
            background: #eef2ff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .pie-chart-container {
            flex: 0 0 300px;
            height: 300px;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            border-top: 1px solid #e2e8f0;
        }
        @media (max-width: 768px) {
            .score-section, .tags-section {
                flex-direction: column;
            }
            .chart-container, .pie-chart-container {
                flex: none;
                width: 100%;
                height: 250px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{testTitle}}</h1>
            <p>Test Results Report</p>
        </div>
        
        <div class="content">
            {{sections}}
        </div>
        
        <div class="footer">
            <p>Generated on {{generatedDate}} | Template Version ${version}</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sections = {{sectionsJson}};
            
            sections.forEach((section, index) => {
                if (section.isScoreSection) {
                    const canvas = document.getElementById('chart-' + index);
                    if (canvas) {
                        new Chart(canvas, {
                            type: 'doughnut',
                            data: {
                                labels: ['Correct', 'Incorrect'],
                                datasets: [{
                                    data: [section.score, section.total - section.score],
                                    backgroundColor: ['#10b981', '#ef4444'],
                                    borderWidth: 0
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }
                        });
                    }
                } else if (section.isTagSection) {
                    const canvas = document.getElementById('pie-' + index);
                    if (canvas) {
                        new Chart(canvas, {
                            type: 'pie',
                            data: {
                                labels: section.tags.map(tag => tag.name),
                                datasets: [{
                                    data: section.tags.map(tag => tag.count),
                                    backgroundColor: [
                                        '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b',
                                        '#10b981', '#f97316', '#84cc16', '#06b6d4'
                                    ]
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right'
                                    }
                                }
                            }
                        });
                    }
                }
            });
        });
    </script>
</body>
</html>`
  }

  const renderTemplate = (template: string, data: TemplateData): string => {
    let html = template

    // Replace basic variables
    html = html.replace(/\{\{testTitle\}\}/g, data.testTitle)
    html = html.replace(/\{\{generatedDate\}\}/g, data.generatedDate)

    // Generate sections HTML
    let sectionsHtml = ''
    data.sections.forEach((section, index) => {
      if (section.isScoreSection) {
        sectionsHtml += `
          <div class="test-section">
            <div class="section-header">
              <div class="section-title">${section.sectionName}</div>
              <div class="section-type">${section.sectionType}</div>
            </div>
            <div class="section-content">
              <div class="score-section">
                <div class="score-info">
                  <div class="score-display">${section.score}/${section.total}</div>
                  <div class="score-details">${section.percentage}% Correct</div>
                  <div class="percentage-bar">
                    <div class="percentage-fill" style="width: ${section.percentage}%"></div>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas id="chart-${index}" width="300" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
        `
      } else if (section.isTagSection) {
        const tagsHtml = section.tags?.map(tag => `
          <div class="tag-item">
            <span class="tag-name">${tag.name}</span>
            <span class="tag-count">${tag.count}</span>
          </div>
        `).join('') || ''
        
        sectionsHtml += `
          <div class="test-section">
            <div class="section-header">
              <div class="section-title">${section.sectionName}</div>
              <div class="section-type">${section.sectionType}</div>
            </div>
            <div class="section-content">
              <div class="tags-section">
                <div class="tags-list">
                  <h3 style="margin-top: 0; color: #374151;">Tag Distribution</h3>
                  ${tagsHtml}
                </div>
                <div class="pie-chart-container">
                  <canvas id="pie-${index}" width="300" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
        `
      }
    })

    html = html.replace(/\{\{sections\}\}/g, sectionsHtml)
    html = html.replace(/\{\{sectionsJson\}\}/g, JSON.stringify(data.sections))

    return html
  }

  const downloadReport = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.testTitle.replace(/\s+/g, '-')}-results.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Report Preview</h3>
        <div className="space-x-2">
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download HTML Report
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <iframe
          srcDoc={renderedHtml}
          className="w-full h-96"
          style={{ minHeight: '600px' }}
          title="Report Preview"
        />
      </div>
      
      <p className="text-sm text-gray-600">
        Using Template Version {templateVersion} | Generated on {data.generatedDate}
      </p>
    </div>
  )
}
