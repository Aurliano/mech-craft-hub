// Skills database for each specialization scope
// Each scope has 50 predefined skills

export interface Skill {
  name: string;
  category?: string;
}

// Map scope IDs to their skills
// Note: These are placeholder scope IDs - should match actual scope IDs from backend
export const skillsByScope: Record<string, Skill[]> = {
  // Mechanical Engineering (مهندسی مکانیک)
  'mechanical': [
    { name: 'SolidWorks', category: 'CAD' },
    { name: 'AutoCAD', category: 'CAD' },
    { name: 'CATIA', category: 'CAD' },
    { name: 'Inventor', category: 'CAD' },
    { name: 'Fusion 360', category: 'CAD' },
    { name: 'ANSYS', category: 'CAE' },
    { name: 'ABAQUS', category: 'CAE' },
    { name: 'COMSOL', category: 'CAE' },
    { name: 'MATLAB', category: 'Simulation' },
    { name: 'Simulink', category: 'Simulation' },
    { name: 'LabVIEW', category: 'Automation' },
    { name: 'CNC Programming', category: 'Manufacturing' },
    { name: 'G-Code', category: 'Manufacturing' },
    { name: 'CAM Programming', category: 'Manufacturing' },
    { name: 'Welding', category: 'Manufacturing' },
    { name: 'Machining', category: 'Manufacturing' },
    { name: '3D Modeling', category: 'Design' },
    { name: 'Technical Drawing', category: 'Design' },
    { name: 'GD&T', category: 'Design' },
    { name: 'Thermodynamics', category: 'Engineering' },
    { name: 'Fluid Mechanics', category: 'Engineering' },
    { name: 'Heat Transfer', category: 'Engineering' },
    { name: 'Mechanical Design', category: 'Design' },
    { name: 'Product Design', category: 'Design' },
    { name: 'Rapid Prototyping', category: 'Manufacturing' },
    { name: '3D Printing', category: 'Manufacturing' },
    { name: 'Sheet Metal Design', category: 'Design' },
    { name: 'Plastic Design', category: 'Design' },
    { name: 'Mold Design', category: 'Design' },
    { name: 'Quality Control', category: 'Quality' },
    { name: 'Metrology', category: 'Quality' },
    { name: 'Project Management', category: 'Management' },
    { name: 'Technical Writing', category: 'Documentation' },
    { name: 'FEA Analysis', category: 'CAE' },
    { name: 'CFD Analysis', category: 'CAE' },
    { name: 'Vibration Analysis', category: 'CAE' },
    { name: 'Material Selection', category: 'Engineering' },
    { name: 'Manufacturing Processes', category: 'Manufacturing' },
    { name: 'Assembly Design', category: 'Design' },
    { name: 'Mechanism Design', category: 'Design' },
    { name: 'Robotics', category: 'Automation' },
    { name: 'PLC Programming', category: 'Automation' },
    { name: 'Hydraulics', category: 'Engineering' },
    { name: 'Pneumatics', category: 'Engineering' },
    { name: 'Machine Design', category: 'Design' },
    { name: 'Tool Design', category: 'Design' },
    { name: 'Jig & Fixture Design', category: 'Design' },
    { name: 'Maintenance Engineering', category: 'Engineering' },
    { name: 'Reliability Engineering', category: 'Engineering' },
    { name: 'Lean Manufacturing', category: 'Manufacturing' },
  ],

  // Computer Engineering (مهندسی کامپیوتر)
  'computer': [
    { name: 'Python', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'C++', category: 'Programming' },
    { name: 'C#', category: 'Programming' },
    { name: 'React', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Django', category: 'Backend' },
    { name: 'Flask', category: 'Backend' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Azure', category: 'Cloud' },
    { name: 'Git', category: 'Version Control' },
    { name: 'CI/CD', category: 'DevOps' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Deep Learning', category: 'AI/ML' },
    { name: 'TensorFlow', category: 'AI/ML' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'Data Analysis', category: 'Data Science' },
    { name: 'Pandas', category: 'Data Science' },
    { name: 'NumPy', category: 'Data Science' },
    { name: 'Scikit-learn', category: 'AI/ML' },
    { name: 'RESTful API', category: 'Backend' },
    { name: 'GraphQL', category: 'Backend' },
    { name: 'Microservices', category: 'Architecture' },
    { name: 'System Design', category: 'Architecture' },
    { name: 'Algorithms', category: 'Computer Science' },
    { name: 'Data Structures', category: 'Computer Science' },
    { name: 'Linux', category: 'Operating System' },
    { name: 'Shell Scripting', category: 'Scripting' },
    { name: 'Agile/Scrum', category: 'Methodology' },
    { name: 'Test-Driven Development', category: 'Methodology' },
    { name: 'Unit Testing', category: 'Testing' },
    { name: 'Integration Testing', category: 'Testing' },
    { name: 'Web Security', category: 'Security' },
    { name: 'Cryptography', category: 'Security' },
    { name: 'Blockchain', category: 'Technology' },
    { name: 'IoT', category: 'Technology' },
    { name: 'Embedded Systems', category: 'Hardware' },
  ],

  // Electrical Engineering (مهندسی برق)
  'electrical': [
    { name: 'PLC Programming', category: 'Automation' },
    { name: 'SCADA', category: 'Automation' },
    { name: 'HMI Design', category: 'Automation' },
    { name: 'VFD Programming', category: 'Automation' },
    { name: 'Electrical Design', category: 'Design' },
    { name: 'Power Systems', category: 'Power' },
    { name: 'Circuit Design', category: 'Design' },
    { name: 'PCB Design', category: 'Design' },
    { name: 'Altium Designer', category: 'CAD' },
    { name: 'KiCad', category: 'CAD' },
    { name: 'Eagle', category: 'CAD' },
    { name: 'OrCAD', category: 'CAD' },
    { name: 'FPGA', category: 'Hardware' },
    { name: 'VHDL', category: 'Hardware' },
    { name: 'Verilog', category: 'Hardware' },
    { name: 'Embedded C', category: 'Programming' },
    { name: 'Arduino', category: 'Microcontroller' },
    { name: 'Raspberry Pi', category: 'Microcontroller' },
    { name: 'STM32', category: 'Microcontroller' },
    { name: 'Motor Control', category: 'Control' },
    { name: 'Power Electronics', category: 'Power' },
    { name: 'Inverters', category: 'Power' },
    { name: 'Transformers', category: 'Power' },
    { name: 'Protection Systems', category: 'Power' },
    { name: 'Relay Logic', category: 'Control' },
    { name: 'Ladder Logic', category: 'Control' },
    { name: 'Industrial Automation', category: 'Automation' },
    { name: 'Process Control', category: 'Control' },
    { name: 'Instrumentation', category: 'Control' },
    { name: 'Sensors & Actuators', category: 'Hardware' },
    { name: 'Signal Processing', category: 'Signal' },
    { name: 'Control Systems', category: 'Control' },
    { name: 'PID Control', category: 'Control' },
    { name: 'Electrical Safety', category: 'Safety' },
    { name: 'NEC/IEC Standards', category: 'Standards' },
    { name: 'Load Calculation', category: 'Design' },
    { name: 'Short Circuit Analysis', category: 'Analysis' },
    { name: 'Power Factor Correction', category: 'Power' },
    { name: 'Lighting Design', category: 'Design' },
    { name: 'Fire Alarm Systems', category: 'Safety' },
    { name: 'Security Systems', category: 'Security' },
    { name: 'Building Automation', category: 'Automation' },
    { name: 'Energy Management', category: 'Power' },
    { name: 'Renewable Energy', category: 'Power' },
    { name: 'Solar Systems', category: 'Power' },
    { name: 'Wind Energy', category: 'Power' },
    { name: 'Battery Systems', category: 'Power' },
    { name: 'Electrical Testing', category: 'Testing' },
    { name: 'Troubleshooting', category: 'Maintenance' },
  ],

  // Metaverse (متاورس)
  'metaverse': [
    { name: 'Unity', category: 'Game Engine' },
    { name: 'Unreal Engine', category: 'Game Engine' },
    { name: 'Blender', category: '3D Modeling' },
    { name: 'Maya', category: '3D Modeling' },
    { name: '3ds Max', category: '3D Modeling' },
    { name: 'Cinema 4D', category: '3D Modeling' },
    { name: 'VR Development', category: 'VR/AR' },
    { name: 'AR Development', category: 'VR/AR' },
    { name: 'XR Development', category: 'VR/AR' },
    { name: 'Oculus SDK', category: 'VR Platform' },
    { name: 'SteamVR', category: 'VR Platform' },
    { name: 'WebXR', category: 'VR Platform' },
    { name: '3D Animation', category: 'Animation' },
    { name: 'Character Animation', category: 'Animation' },
    { name: 'Rigging', category: 'Animation' },
    { name: 'Texturing', category: '3D Art' },
    { name: 'UV Mapping', category: '3D Art' },
    { name: 'Shading', category: '3D Art' },
    { name: 'Lighting', category: '3D Art' },
    { name: 'Rendering', category: '3D Art' },
    { name: 'Particle Systems', category: 'Effects' },
    { name: 'VFX', category: 'Effects' },
    { name: 'Motion Graphics', category: 'Animation' },
    { name: 'Game Design', category: 'Design' },
    { name: 'Level Design', category: 'Design' },
    { name: 'UI/UX for VR', category: 'Design' },
    { name: 'Spatial Audio', category: 'Audio' },
    { name: '3D Audio', category: 'Audio' },
    { name: 'Physics Simulation', category: 'Simulation' },
    { name: 'Collision Detection', category: 'Programming' },
    { name: 'C# Scripting', category: 'Programming' },
    { name: 'Blueprints', category: 'Programming' },
    { name: 'Shader Programming', category: 'Programming' },
    { name: 'HLSL', category: 'Programming' },
    { name: 'GLSL', category: 'Programming' },
    { name: 'Performance Optimization', category: 'Optimization' },
    { name: 'Asset Pipeline', category: 'Workflow' },
    { name: 'Version Control for 3D', category: 'Workflow' },
    { name: 'Procedural Generation', category: 'Programming' },
    { name: 'AI in Games', category: 'AI' },
    { name: 'NPC Behavior', category: 'AI' },
    { name: 'Multiplayer Networking', category: 'Networking' },
    { name: 'Blockchain Integration', category: 'Blockchain' },
    { name: 'NFT Development', category: 'Blockchain' },
    { name: 'Virtual Economy', category: 'Economy' },
    { name: 'Avatar Creation', category: '3D Art' },
    { name: 'Virtual Events', category: 'Events' },
    { name: 'Spatial Computing', category: 'Technology' },
  ],
};

// Helper function to get skills for a scope by name or display_name
export function getSkillsForScope(scopeName: string): Skill[] {
  const scopeKey = scopeName.toLowerCase().replace(/\s+/g, '').replace(/[^\w\u0600-\u06FF]/g, '');
  
  // Map common scope names (both English and Persian) to keys
  const scopeMap: Record<string, string> = {
    // Mechanical Engineering
    'mechanical': 'mechanical',
    'مهندسی مکانیک': 'mechanical',
    'مکانیک': 'mechanical',
    'mechanicalengineering': 'mechanical',
    
    // Computer Engineering
    'computer': 'computer',
    'مهندسی کامپیوتر': 'computer',
    'کامپیوتر': 'computer',
    'computerengineering': 'computer',
    
    // Electrical Engineering
    'electrical': 'electrical',
    'مهندسی برق': 'electrical',
    'برق': 'electrical',
    'electricalengineering': 'electrical',
    
    // Metaverse
    'metaverse': 'metaverse',
    'متاورس': 'metaverse',
  };
  
  const key = scopeMap[scopeKey] || scopeKey;
  return skillsByScope[key] || [];
}

// Get all unique skills across all scopes
export function getAllSkills(): Skill[] {
  const allSkills = new Map<string, Skill>();
  Object.values(skillsByScope).forEach(skills => {
    skills.forEach(skill => {
      if (!allSkills.has(skill.name)) {
        allSkills.set(skill.name, skill);
      }
    });
  });
  return Array.from(allSkills.values());
}

// Search skills by query
export function searchSkills(query: string, scopeIds?: string[]): Skill[] {
  const queryLower = query.toLowerCase();
  const results: Skill[] = [];
  
  if (scopeIds && scopeIds.length > 0) {
    // Search in specific scopes
    scopeIds.forEach(scopeId => {
      const skills = skillsByScope[scopeId] || [];
      skills.forEach(skill => {
        if (skill.name.toLowerCase().includes(queryLower) && 
            !results.some(s => s.name === skill.name)) {
          results.push(skill);
        }
      });
    });
  } else {
    // Search in all skills
    getAllSkills().forEach(skill => {
      if (skill.name.toLowerCase().includes(queryLower)) {
        results.push(skill);
      }
    });
  }
  
  return results.slice(0, 10); // Limit to 10 results
}

