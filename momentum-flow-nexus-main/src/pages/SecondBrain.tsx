
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Tag, Link as LinkIcon, Edit, Trash2, Brain } from "lucide-react";
import { format } from "date-fns";

interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: { title: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const SecondBrain = () => {
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>(getSampleKnowledgeCards());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KnowledgeCard | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLinks, setFormLinks] = useState("");
  
  const handleOpenNewCardDialog = () => {
    setEditingCard(null);
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormLinks("");
    setNewCardDialogOpen(true);
  };
  
  const handleOpenEditCardDialog = (card: KnowledgeCard) => {
    setEditingCard(card);
    setFormTitle(card.title);
    setFormContent(card.content);
    setFormTags(card.tags.join(', '));
    setFormLinks(card.links.map(link => `${link.title}: ${link.url}`).join('\n'));
    setNewCardDialogOpen(true);
  };
  
  const handleSaveCard = () => {
    // Parse tags and links
    const tags = formTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const links = formLinks.split('\n')
      .map(link => {
        const [title, url] = link.split(':').map(part => part.trim());
        return url ? { title: title || url, url } : null;
      })
      .filter((link): link is {title: string, url: string} => link !== null);
    
    if (editingCard) {
      // Update existing card
      setKnowledgeCards(knowledgeCards.map(card => 
        card.id === editingCard.id 
          ? { 
              ...card, 
              title: formTitle, 
              content: formContent, 
              tags, 
              links, 
              updatedAt: new Date() 
            } 
          : card
      ));
    } else {
      // Create new card
      const newCard: KnowledgeCard = {
        id: `card-${Date.now()}`,
        title: formTitle,
        content: formContent,
        tags,
        links,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setKnowledgeCards([newCard, ...knowledgeCards]);
    }
    
    setNewCardDialogOpen(false);
  };
  
  const handleDeleteCard = (cardId: string) => {
    setKnowledgeCards(knowledgeCards.filter(card => card.id !== cardId));
  };
  
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Get all unique tags across all cards
  const allTags = Array.from(new Set(knowledgeCards.flatMap(card => card.tags)));
  
  // Filter cards based on search query and selected tags
  const filteredCards = knowledgeCards.filter(card => {
    const matchesSearch = searchQuery === "" || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => card.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <GradientHeading as="h1">
            <div className="flex items-center">
              <Brain className="h-8 w-8 mr-2" />
              Second Brain
            </div>
          </GradientHeading>
          <p className="text-muted-foreground">Capture and organize your knowledge</p>
        </div>
        <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-momentum-purple to-momentum-pink text-white" onClick={handleOpenNewCardDialog}>
              <Plus className="h-4 w-4 mr-2" /> New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCard ? "Edit Knowledge Card" : "Create Knowledge Card"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input 
                  placeholder="Card title" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea 
                  placeholder="Write your notes here..." 
                  className="min-h-[200px]"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <Input 
                  placeholder="productivity, reference, idea" 
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Links (one per line, format: title: url)</label>
                <Textarea 
                  placeholder="Documentation: https://example.com/docs" 
                  className="min-h-[80px]"
                  value={formLinks}
                  onChange={(e) => setFormLinks(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewCardDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCard}>{editingCard ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex gap-6">
        <div className="w-full md:w-3/4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10" 
              placeholder="Search knowledge cards..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No knowledge cards found.</p>
              <p className="text-muted-foreground">Create one to get started!</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(card.updatedAt), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm text-muted-foreground mb-4 max-h-[150px] overflow-y-auto">
                    {card.content}
                  </div>
                  
                  {card.links.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium mb-1">Links:</div>
                      <div className="space-y-1">
                        {card.links.map((link, idx) => (
                          <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="flex items-center text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTag(tag);
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleOpenEditCardDialog(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="hidden md:block w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Filter by Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div 
                    key={tag}
                    className={`flex items-center text-xs rounded-full px-2 py-1 cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleToggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
              
              {selectedTags.length > 0 && (
                <Button 
                  variant="link" 
                  className="text-xs pl-0 mt-2" 
                  onClick={() => setSelectedTags([])}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

function getSampleKnowledgeCards(): KnowledgeCard[] {
  return [
    {
      id: "card-1",
      title: "Productivity Systems Overview",
      content: "Different productivity systems:\n• Getting Things Done (GTD)\n• Pomodoro Technique\n• Time Blocking\n• Eisenhower Matrix\n\nKey is to find what works for your personal workflow and adapt as needed.",
      tags: ["productivity", "methods", "time-management"],
      links: [
        { title: "GTD in 15 minutes", url: "https://hamberg.no/gtd" },
        { title: "Pomodoro Technique", url: "https://francescocirillo.com/pages/pomodoro-technique" }
      ],
      createdAt: new Date(2024, 4, 1),
      updatedAt: new Date(2024, 4, 1)
    },
    {
      id: "card-2",
      title: "SMART Goals Framework",
      content: "SMART goals are:\n• Specific: Well-defined and clear\n• Measurable: Include metrics to track progress\n• Achievable: Realistic given resources\n• Relevant: Aligned with broader objectives\n• Time-bound: With a deadline\n\nExample: Instead of 'increase sales', use 'increase monthly sales by 10% within Q3 through targeted email marketing campaigns'.",
      tags: ["goals", "planning", "frameworks"],
      links: [
        { title: "SMART Goals Guide", url: "https://www.mindtools.com/pages/article/smart-goals.htm" }
      ],
      createdAt: new Date(2024, 4, 5),
      updatedAt: new Date(2024, 4, 10)
    },
    {
      id: "card-3",
      title: "Weekly Review Process",
      content: "My personal weekly review process:\n1. Review previous week's accomplishments\n2. Process inbox and notes to zero\n3. Review upcoming calendar\n4. Update project lists\n5. Identify next actions\n6. Set focus areas for coming week\n\nBest done Sunday evening or Monday morning.",
      tags: ["productivity", "review", "reflection"],
      links: [],
      createdAt: new Date(2024, 4, 15),
      updatedAt: new Date(2024, 4, 15)
    },
    {
      id: "card-4",
      title: "Effective Meeting Guidelines",
      content: "Creating effective meetings:\n• Always have a clear agenda\n• Invite only necessary participants\n• Start and end on time\n• Take clear notes and assign action items\n• End with a summary and next steps\n\nConsider: Is this meeting necessary or could it be an email?",
      tags: ["meetings", "collaboration", "communication"],
      links: [
        { title: "Meeting Cost Calculator", url: "https://www.meetingcostcalculator.com/" }
      ],
      createdAt: new Date(2024, 5, 1),
      updatedAt: new Date(2024, 5, 3)
    }
  ];
}

export default SecondBrain;
