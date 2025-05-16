import { useState } from 'react';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';
import ArtifactViewer from '@/components/artifacts/ArtifactViewer';
import { Button } from '@/components/ui/button';

export default function ArkArtifacts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("artifact-1");

  const artifacts = [
    {
      id: "artifact-1",
      name: "Ancient Computational Sphere",
      description: "This mysterious sphere appears to be an advanced computational device of unknown origin. Its purpose remains a mystery, but it is believed to contain ancient knowledge.",
      requiredItemId: undefined
    },
    {
      id: "artifact-2",
      name: "Crystal Memory Core",
      description: "A crystalline device capable of storing vast amounts of data. Its internal structure reveals mathematical patterns that correspond to astronomical alignments.",
      requiredItemId: undefined // Crystal Tablet
    },
    {
      id: "artifact-3",
      name: "Dimensional Resonator",
      description: "An enigmatic device that seems to manipulate the fabric of space-time. Scholars believe it may have been used for communication across vast distances.",
      requiredItemId: undefined // Requires some specific item
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">The Ark of Artifacts</h1>
      
      <div className="bg-black/30 p-8 rounded-lg">
        <p className="text-center mb-4 text-white/80">
          These ancient artifacts have been recovered from various archaeological sites around the world. 
          Each contains fragments of a forgotten technology and wisdom from a previous age.
        </p>
        
        <div className="flex justify-center mb-8">
          <Link href="/final-artifact">
            <Button className="bg-blue-700 hover:bg-blue-600 text-white">
              View Full 3D Crystal Artifact
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            {artifacts.map(artifact => (
              <TabsTrigger 
                key={artifact.id} 
                value={artifact.id}
                className="data-[state=active]:bg-primary/20"
              >
                {artifact.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {artifacts.map(artifact => (
            <TabsContent key={artifact.id} value={artifact.id} className="mt-0">
              <ArtifactViewer
                artifactId={artifact.id}
                name={artifact.name}
                description={artifact.description}
                requiredItemId={artifact.requiredItemId}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}