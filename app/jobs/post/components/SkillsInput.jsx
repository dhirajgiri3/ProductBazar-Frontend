"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Common tech skills for suggestions
const COMMON_SKILLS = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Ruby", "PHP", "Go", "Swift", "Kotlin",
  
  // Frontend
  "React", "Angular", "Vue.js", "Next.js", "HTML", "CSS", "SASS", "LESS", "Tailwind CSS", "Bootstrap",
  "Redux", "GraphQL", "REST API", "Webpack", "Responsive Design", "UI/UX", "Material UI", "Figma",
  
  // Backend
  "Node.js", "Express", "Django", "Flask", "Spring Boot", "Laravel", "ASP.NET", "Ruby on Rails",
  "FastAPI", "Nest.js", "Microservices", "API Development", "WebSockets",
  
  // Database
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis", "Elasticsearch", "DynamoDB",
  "Oracle", "SQLite", "NoSQL", "Database Design",
  
  // DevOps & Cloud
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions",
  "Terraform", "Ansible", "Linux", "Nginx", "Apache", "Serverless",
  
  // Mobile
  "React Native", "Flutter", "iOS", "Android", "Mobile Development", "Xamarin", "Ionic",
  
  // Testing
  "Jest", "Mocha", "Cypress", "Selenium", "TDD", "Unit Testing", "Integration Testing", "QA",
  
  // Other Tech
  "Machine Learning", "AI", "Data Science", "Blockchain", "IoT", "AR/VR", "Cybersecurity",
  
  // Soft Skills
  "Communication", "Teamwork", "Problem Solving", "Agile", "Scrum", "Project Management",
  "Leadership", "Time Management", "Critical Thinking"
];

const SkillsInput = ({ value = "", onChange, placeholder = "Add skills..." }) => {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Initialize skills from value prop (comma-separated string)
  useEffect(() => {
    if (value && typeof value === "string") {
      const skillsArray = value.split(",").map(skill => skill.trim()).filter(Boolean);
      setSkills(skillsArray);
    }
  }, []);

  // Update parent component when skills change
  useEffect(() => {
    onChange(skills.join(", "));
  }, [skills, onChange]);

  // Handle clicks outside the suggestions box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = COMMON_SKILLS.filter(
        skill =>
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !skills.includes(skill)
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, skills]);

  // Add a skill
  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setInputValue("");
      inputRef.current.focus();
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    addSkill(suggestion);
    setShowSuggestions(false);
  };

  // Animation variants
  const tagVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 bg-white">
        <AnimatePresence>
          {skills.map((skill, index) => (
            <motion.div
              key={`${skill}-${index}`}
              variants={tagVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-800 rounded-md"
            >
              <Tag size={14} />
              <span className="text-sm">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-violet-600 hover:text-violet-800"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="w-full border-none focus:ring-0 p-1 text-sm"
            placeholder={skills.length === 0 ? placeholder : "Add more skills..."}
          />
        </div>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-violet-50 cursor-pointer flex items-center gap-2 text-sm"
              >
                <Plus size={14} className="text-violet-500" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        Press Enter or comma to add a skill. Click on a skill to remove it.
      </p>
    </div>
  );
};

export default SkillsInput;
