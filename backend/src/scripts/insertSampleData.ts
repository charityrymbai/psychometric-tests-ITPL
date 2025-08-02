import dbPromise from '../config/db.js';

const sampleTestResult = {
  testId: "test-1",
  testTitle: "Cognitive Assessment Battery",
  groupId: "group-1", 
  groupName: "Grade 10 Assessment",
  totalScore: 42,
  totalQuestions: 50,
  timeSpent: 2400, // 40 minutes in seconds
  completedAt: "2025-01-15T14:30:00Z",
  templateVersion: 0,
  sections: [
    {
      sectionId: "verbal",
      sectionName: "Verbal Reasoning",
      sectionType: "score",
      score: 18,
      totalQuestions: 20,
      percentage: 90
    },
    {
      sectionId: "numerical", 
      sectionName: "Numerical Reasoning",
      sectionType: "score",
      score: 15,
      totalQuestions: 20,
      percentage: 75
    },
    {
      sectionId: "personality",
      sectionName: "Personality Assessment", 
      sectionType: "tags",
      tags: [
        { tagName: "Extroversion", tagCount: 8, color: "#3b82f6" },
        { tagName: "Conscientiousness", tagCount: 12, color: "#10b981" },
        { tagName: "Openness", tagCount: 6, color: "#f59e0b" },
        { tagName: "Agreeableness", tagCount: 9, color: "#8b5cf6" },
        { tagName: "Neuroticism", tagCount: 3, color: "#ef4444" }
      ]
    }
  ]
};

const sampleTestResult2 = {
  testId: "test-2",
  testTitle: "Career Aptitude Test", 
  groupId: "group-2",
  groupName: "Career Guidance",
  totalScore: 23,
  totalQuestions: 30,
  timeSpent: 1800, // 30 minutes in seconds
  completedAt: "2025-01-10T10:15:00Z",
  templateVersion: 0,
  sections: [
    {
      sectionId: "analytical",
      sectionName: "Analytical Thinking",
      sectionType: "score",
      score: 12,
      totalQuestions: 15,
      percentage: 80
    },
    {
      sectionId: "interests",
      sectionName: "Career Interests",
      sectionType: "tags", 
      tags: [
        { tagName: "Technology", tagCount: 15, color: "#3b82f6" },
        { tagName: "Creative Arts", tagCount: 8, color: "#8b5cf6" },
        { tagName: "Healthcare", tagCount: 5, color: "#10b981" },
        { tagName: "Business", tagCount: 10, color: "#f59e0b" },
        { tagName: "Education", tagCount: 7, color: "#ef4444" }
      ]
    }
  ]
};

async function insertSampleData() {
  try {
    const db = await dbPromise;
    
    // Insert first sample report
    const [result1] = await db.execute(
      `INSERT INTO reports_generated (data, version) VALUES (?, ?)`,
      [JSON.stringify(sampleTestResult), 0]
    );

    // Insert second sample report
    const [result2] = await db.execute(
      `INSERT INTO reports_generated (data, version) VALUES (?, ?)`,
      [JSON.stringify(sampleTestResult2), 0]
    );

    console.log('Sample data inserted successfully!');
    console.log('Report 1 ID:', (result1 as any).insertId);
    console.log('Report 2 ID:', (result2 as any).insertId);
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

insertSampleData();
