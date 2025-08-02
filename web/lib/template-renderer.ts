// Template utility for rendering test results
export interface TestSection {
  sectionName: string;
  sectionType: string;
  isScoreSection?: boolean;
  isTagSection?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  tags?: Array<{
    name: string;
    count: number;
  }>;
}

export interface TestResultsData {
  testTitle: string;
  sections: TestSection[];
  generatedDate: string;
}

export class ResultsTemplateRenderer {
  static renderTemplate(templateVersion: number, data: TestResultsData): string {
    // In a real implementation, you would load the template from the file system
    // For now, we'll use a simple string replacement approach
    
    let template = this.getTemplate(templateVersion);
    
    // Replace basic variables
    template = template.replace(/\{\{testTitle\}\}/g, data.testTitle);
    template = template.replace(/\{\{generatedDate\}\}/g, data.generatedDate);
    
    // Handle sections
    let sectionsHtml = '';
    data.sections.forEach((section, index) => {
      sectionsHtml += this.renderSection(section, index);
    });
    
    // Replace sections placeholder
    template = template.replace(/\{\{#sections\}\}[\s\S]*?\{\{\/sections\}\}/g, sectionsHtml);
    
    // Replace sections JSON for JavaScript
    template = template.replace(/\{\{\{sectionsJson\}\}\}/g, JSON.stringify(data.sections));
    
    return template;
  }
  
  private static getTemplate(version: number): string {
    // This would typically load from the file system
    // For now, return a basic template structure
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>{{testTitle}}</title>
        <!-- Template styles would be loaded here -->
    </head>
    <body>
        <div class="container">
            <h1>{{testTitle}}</h1>
            {{#sections}}
            <!-- Section content -->
            {{/sections}}
            <footer>Generated on {{generatedDate}} | Template Version ${version}</footer>
        </div>
        <script>
            const sections = {{{sectionsJson}}};
            // Chart initialization code
        </script>
    </body>
    </html>
    `;
  }
  
  private static renderSection(section: TestSection, index: number): string {
    if (section.isScoreSection) {
      return `
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
      `;
    } else if (section.isTagSection) {
      const tagsHtml = section.tags?.map(tag => `
        <div class="tag-item">
          <span class="tag-name">${tag.name}</span>
          <span class="tag-count">${tag.count}</span>
        </div>
      `).join('') || '';
      
      return `
        <div class="test-section">
          <div class="section-header">
            <div class="section-title">${section.sectionName}</div>
            <div class="section-type">${section.sectionType}</div>
          </div>
          <div class="section-content">
            <div class="tags-section">
              <div class="tags-list">
                <h3>Tag Distribution</h3>
                ${tagsHtml}
              </div>
              <div class="pie-chart-container">
                <canvas id="pie-${index}" width="300" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }
}
