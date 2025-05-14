
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlignLeft, Users, Calendar, DollarSign, AlertTriangle, MessageSquare, FileText, CheckSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format, addDays } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: "planning" | "active" | "completed" | "on-hold";
  team: { name: string; role: string }[];
  milestones: { id: string; title: string; dueDate: Date | null; completed: boolean }[];
  budget: number;
  resources: string[];
  risks: string[];
  completionPercentage: number;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(getSampleProjects());
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: newProjectTitle,
      description: "",
      startDate: new Date(),
      endDate: null,
      status: "planning",
      team: [],
      milestones: [],
      budget: 0,
      resources: [],
      risks: [],
      completionPercentage: 0,
    };
    
    setProjects([newProject, ...projects]);
    setNewProjectTitle("");
    setIsNewProjectDialogOpen(false);
  };
  
  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
  };
  
  const handleCloseProject = () => {
    setSelectedProject(null);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };
  
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const updatedMilestones = project.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return { ...milestone, completed: !milestone.completed };
          }
          return milestone;
        });
        
        const completedMilestonesCount = updatedMilestones.filter(m => m.completed).length;
        const completionPercentage = updatedMilestones.length > 0
          ? (completedMilestonesCount / updatedMilestones.length) * 100
          : 0;
        
        const updatedProject = {
          ...project,
          milestones: updatedMilestones,
          completionPercentage
        };
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        
        return updatedProject;
      }
      return project;
    }));
  };
  
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-600";
      case "active": return "bg-green-100 text-green-600";
      case "completed": return "bg-purple-100 text-purple-600";
      case "on-hold": return "bg-amber-100 text-amber-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <GradientHeading as="h1">Projects</GradientHeading>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white">
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <Input 
                  placeholder="Enter project name" 
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedProject ? (
        <div className="space-y-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleCloseProject}>
              Back to Projects
            </Button>
            <div className="flex gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
              </div>
              <Button>Save Changes</Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedProject.title}</CardTitle>
              <CardDescription>
                {selectedProject.startDate && `Started: ${format(new Date(selectedProject.startDate), "MMM d, yyyy")}`}
                {selectedProject.endDate && ` • Due: ${format(new Date(selectedProject.endDate), "MMM d, yyyy")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <AlignLeft className="h-5 w-5 mr-2" /> Overview
                </h3>
                <Textarea
                  placeholder="Project description and goals..."
                  className="min-h-[100px]"
                  value={selectedProject.description}
                  onChange={(e) => handleUpdateProject({...selectedProject, description: e.target.value})}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" /> Team Structure
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.team.map((member, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{member.name}</td>
                          <td className="p-3">{member.role}</td>
                        </tr>
                      ))}
                      <tr className="border-t">
                        <td colSpan={2} className="p-3">
                          <Button variant="ghost" size="sm" className="w-full flex justify-center">
                            <Plus className="h-4 w-4 mr-1" /> Add Team Member
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> Timeline & Milestones
                </h3>
                <div className="space-y-2 mb-2">
                  {selectedProject.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMilestone(selectedProject.id, milestone.id)}
                          className={`flex items-center justify-center h-5 w-5 rounded border ${
                            milestone.completed
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-gray-300'
                          }`}
                        >
                          {milestone.completed && <CheckSquare className="h-3 w-3" />}
                        </button>
                        <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                          {milestone.title}
                        </span>
                      </div>
                      {milestone.dueDate && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Milestone
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" /> Budget & Resources
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Budget</label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input 
                          type="number"
                          value={selectedProject.budget}
                          onChange={(e) => handleUpdateProject({...selectedProject, budget: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Resources</label>
                      <Textarea 
                        placeholder="List required resources..."
                        value={selectedProject.resources.join('\n')}
                        onChange={(e) => handleUpdateProject({
                          ...selectedProject, 
                          resources: e.target.value.split('\n').filter(line => line.trim())
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" /> Risk Management
                  </h3>
                  <Textarea 
                    placeholder="List potential risks and mitigation strategies..."
                    className="min-h-[150px]"
                    value={selectedProject.risks.join('\n')}
                    onChange={(e) => handleUpdateProject({
                      ...selectedProject, 
                      risks: e.target.value.split('\n').filter(line => line.trim())
                    })}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" /> Communication Plan
                </h3>
                <Textarea 
                  placeholder="Define communication channels, meeting frequency..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2" /> Documentation
                </h3>
                <div className="border border-dashed rounded-md p-8 text-center">
                  <p className="text-muted-foreground mb-2">Drop files here or click to upload</p>
                  <Button variant="outline">Upload Files</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 min-h-[38px]">
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(project.startDate), "MMM d, yyyy")}
                  </div>
                  <div>{project.team.length} team members</div>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Progress</span>
                    <span className="text-xs">{Math.round(project.completionPercentage)}%</span>
                  </div>
                  <Progress value={project.completionPercentage} className="h-1.5" />
                </div>
                
                <div className="flex gap-1 flex-wrap mb-2">
                  {project.milestones.slice(0, 2).map((milestone, index) => (
                    <div 
                      key={index} 
                      className={`text-xs px-2 py-0.5 rounded-full ${milestone.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-50 text-blue-600'}`}
                    >
                      {milestone.title.length > 20 ? milestone.title.substring(0, 20) + '...' : milestone.title}
                    </div>
                  ))}
                  {project.milestones.length > 2 && (
                    <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                      +{project.milestones.length - 2} more
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full" onClick={() => handleOpenProject(project)}>
                  Open Project
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

function getSampleProjects(): Project[] {
  const today = new Date();
  
  return [
    {
      id: "project-1",
      title: "Website Redesign",
      description: "Modernize the company website with a new design and improved user experience",
      startDate: today,
      endDate: addDays(today, 45),
      status: "active",
      team: [
        { name: "Jane Smith", role: "Project Manager" },
        { name: "John Doe", role: "UI/UX Designer" },
        { name: "Alex Johnson", role: "Frontend Developer" }
      ],
      milestones: [
        { id: "m1", title: "Requirements Gathering", dueDate: addDays(today, 7), completed: true },
        { id: "m2", title: "Design Mockups", dueDate: addDays(today, 14), completed: true },
        { id: "m3", title: "Frontend Development", dueDate: addDays(today, 30), completed: false },
        { id: "m4", title: "Testing", dueDate: addDays(today, 40), completed: false },
        { id: "m5", title: "Launch", dueDate: addDays(today, 45), completed: false }
      ],
      budget: 20000,
      resources: ["Design software licenses", "Stock photos", "Web hosting"],
      risks: ["Team bandwidth may be limited", "Client feedback delays"],
      completionPercentage: 40
    },
    {
      id: "project-2",
      title: "Product Launch Campaign",
      description: "Marketing campaign for the launch of our new flagship product",
      startDate: addDays(today, -15),
      endDate: addDays(today, 30),
      status: "active",
      team: [
        { name: "Sarah Williams", role: "Marketing Director" },
        { name: "Mike Brown", role: "Content Creator" },
        { name: "Lisa Chen", role: "Social Media Manager" }
      ],
      milestones: [
        { id: "m6", title: "Campaign Strategy", dueDate: addDays(today, -10), completed: true },
        { id: "m7", title: "Content Creation", dueDate: addDays(today, 5), completed: false },
        { id: "m8", title: "Media Outreach", dueDate: addDays(today, 15), completed: false },
        { id: "m9", title: "Product Launch Event", dueDate: addDays(today, 30), completed: false }
      ],
      budget: 50000,
      resources: ["Advertising budget", "Event space", "PR agency"],
      risks: ["Competitor launching similar product", "Supply chain delays"],
      completionPercentage: 25
    },
    {
      id: "project-3",
      title: "Mobile App Development",
      description: "Develop a mobile app version of our main product for iOS and Android",
      startDate: addDays(today, -60),
      endDate: addDays(today, 20),
      status: "on-hold",
      team: [
        { name: "David Lee", role: "Project Manager" },
        { name: "Emma Garcia", role: "iOS Developer" },
        { name: "Ryan Taylor", role: "Android Developer" },
        { name: "Sophia Kim", role: "QA Engineer" }
      ],
      milestones: [
        { id: "m10", title: "Requirements Specification", dueDate: addDays(today, -50), completed: true },
        { id: "m11", title: "UI/UX Design", dueDate: addDays(today, -30), completed: true },
        { id: "m12", title: "iOS Development", dueDate: addDays(today, 10), completed: false },
        { id: "m13", title: "Android Development", dueDate: addDays(today, 15), completed: false },
        { id: "m14", title: "Testing & QA", dueDate: addDays(today, 20), completed: false },
        { id: "m15", title: "App Store Submission", dueDate: addDays(today, 20), completed: false }
      ],
      budget: 75000,
      resources: ["Development tools", "Testing devices", "API access"],
      risks: ["Technical challenges with native APIs", "App store review delays"],
      completionPercentage: 60
    }
  ];
}

export default Projects;
