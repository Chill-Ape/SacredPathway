import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Info, Box, Lock, ChevronsRight } from 'lucide-react';
import ArtifactViewer from '@/components/artifacts/ArtifactViewer';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

// Artifact data (in a real app, this would come from the database)
const artifacts = [
  {
    id: 'crystal-artifact',
    name: 'The Crystal Nexus',
    description: 'An ancient crystalline device of unknown origin. Its geometric patterns suggest it was designed to channel and amplify energy through sacred geometrical alignments.',
    shortDescription: 'An enigmatic crystalline artifact from before the Great Flood.',
    lore: 'This artifact is believed to have been used by the ancient Apkallu, the Seven Sages who brought knowledge and civilization to humanity before the great cataclysm. Its intricate geometric patterns create resonance fields that can amplify consciousness when activated with the right energy source.',
    requiredItemId: '5', // This would be the ID of the obsidian crystal in the inventory
    requiredItemName: 'Obsidian Crystal',
    discoveredText: 'The Nexus hums with energy, revealing encrypted transmissions from the Apkallu. These ancient messages speak of cosmic cycles and the path of enlightenment through sacred knowledge.',
  },
  {
    id: 'golden-tablet',
    name: 'The Golden Tablet of Enki',
    description: 'A small golden tablet inscribed with proto-cuneiform writing, depicting celestial alignments and mathematical formulas beyond ancient capabilities.',
    shortDescription: 'A golden tablet containing ancient wisdom from the god Enki.',
    lore: 'The Golden Tablet is said to contain the divine knowledge gifted to humanity by Enki, the god of wisdom and creation in Sumerian mythology. Its inscriptions detail the sacred mathematical principles that govern the universe and the blueprint for advanced technologies lost to time.',
    requiredItemId: '1', // This would be the ID of the quartz crystal in the inventory
    requiredItemName: 'Quartz Crystal',
    discoveredText: 'The tablet resonates with your crystal, revealing hidden glyphs that detail the construction of an ancient device - possibly a star map or navigational tool for cosmic travelers.',
  }
];

export default function ArkArtifacts() {
  const [, setLocation] = useLocation();
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(artifacts[0].id);
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('view');

  // Get the selected artifact
  const selectedArtifact = artifacts.find(artifact => artifact.id === selectedArtifactId) || artifacts[0];
  
  // Handle artifact navigation
  const handlePreviousArtifact = () => {
    const currentIndex = artifacts.findIndex(a => a.id === selectedArtifactId);
    const previousIndex = (currentIndex - 1 + artifacts.length) % artifacts.length;
    setSelectedArtifactId(artifacts[previousIndex].id);
  };
  
  const handleNextArtifact = () => {
    const currentIndex = artifacts.findIndex(a => a.id === selectedArtifactId);
    const nextIndex = (currentIndex + 1) % artifacts.length;
    setSelectedArtifactId(artifacts[nextIndex].id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Ark Artifacts</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousArtifact}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextArtifact}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with artifact list */}
          <div className="lg:col-span-1">
            <Card className="bg-black/50 border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">Discovered Artifacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {artifacts.map((artifact) => (
                    <div 
                      key={artifact.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-primary/10 transition-colors ${
                        selectedArtifactId === artifact.id ? 'bg-primary/20 border-l-4 border-primary' : ''
                      }`}
                      onClick={() => setSelectedArtifactId(artifact.id)}
                    >
                      <Box className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="font-medium">{artifact.name}</p>
                        <p className="text-xs text-muted-foreground">{artifact.shortDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-black/50 border border-primary/30">
                <TabsTrigger value="view" className="data-[state=active]:bg-primary/20">
                  <Box className="h-4 w-4 mr-2" />
                  Artifact Viewer
                </TabsTrigger>
                <TabsTrigger value="info" className="data-[state=active]:bg-primary/20">
                  <Info className="h-4 w-4 mr-2" />
                  Artifact Info
                </TabsTrigger>
              </TabsList>

              {/* 3D Artifact Viewer */}
              <TabsContent value="view" className="border-none p-0 mt-4">
                <ArtifactViewer 
                  artifactId={selectedArtifact.id}
                  name={selectedArtifact.name}
                  description={selectedArtifact.description}
                  requiredItemId={selectedArtifact.requiredItemId}
                  requiredItemName={selectedArtifact.requiredItemName}
                />
              </TabsContent>

              {/* Artifact Information */}
              <TabsContent value="info" className="border-none p-0 mt-4">
                <Card className="bg-black/50 border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">{selectedArtifact.name}</CardTitle>
                    <CardDescription>{selectedArtifact.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Ancient Lore</h3>
                      <p className="text-sm">{selectedArtifact.lore}</p>
                    </div>
                    <Separator className="bg-primary/30" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Activation Requirements</h3>
                      <div className="flex items-center space-x-2 bg-primary/10 p-3 rounded-md">
                        <Lock className="h-5 w-5 text-primary" />
                        <p className="text-sm">
                          This artifact requires a <span className="font-semibold text-primary">{selectedArtifact.requiredItemName}</span> to unlock its secrets.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Discoveries</h3>
                      <div className="bg-black/60 border border-primary/30 p-4 rounded-md">
                        <div className="flex items-start mb-2">
                          <ChevronsRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <p className="text-primary font-semibold">When unlocked, this artifact reveals:</p>
                        </div>
                        <p className="text-sm ml-7">{selectedArtifact.discoveredText}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setActiveTab('view')}>
                      Return to Artifact Viewer
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}