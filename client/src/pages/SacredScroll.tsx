import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// Import the ancient tablet dark image for the scroll
import ancientTabletDarkImage from "@assets/ChatGPT Image Apr 24, 2025, 06_22_14 PM.png";

interface ScrollData {
  title: string;
  pages: {
    title: string;
    content: string;
  }[];
}

export default function SacredScroll() {
  const [match, params] = useRoute('/sacred-scroll/:id');
  const scrollId = match ? parseInt(params.id, 10) : 0;
  const [, navigate] = useLocation();
  
  console.log("Sacred Scroll ID:", scrollId); // Debug scroll ID
  
  const [scrollData, setScrollData] = useState<ScrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Fetch the scroll data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch data for scroll ID:", scrollId);
        
        // For "Legacy of the Lost Age" (id 37), use hardcoded data
        if (scrollId === 37) {
          console.log("Using hardcoded ancient civilizations scroll data");
          
          const scrollData = {
            title: "Ancient Civilizations, Flood Myths, and the Legacy of a Lost Age",
            pages: [
              {
                title: "Introduction and Timeline of Early Developments",
                content: "Many ancient cultures recount a great flood that devastated the world, sparing only a few survivors. These flood myths often coincide with the dawn of civilization in Mesopotamia and Egypt. Early archaeological evidence from ancient Mesopotamia – notably the city of Eridu – and from predynastic Egypt reveals surprisingly sophisticated development, including large temples and the first pyramids. Curiously, some myths and ruins hint that the earliest phases of these civilizations might have drawn on knowledge inherited from an even earlier age.\n\nc. 10,000 BC (12,000 years ago) – End of the Ice Age; global climate warms and glaciers melt. Sea levels rise ~120 m from the Last Glacial Maximum to 8000 BP (ca. 6000 BC), inundating coastal plains. This period includes events like Meltwater Pulse 1A (a rapid sea-level jump) and has been proposed as the time of a great cataclysmic flood.\n\nc. 7500 BC – The low-lying \"Gulf Oasis\" (land under the present Persian Gulf) is completely flooded by rising seas. Archaeological studies note a \"sudden increase in settlements\" above the old shoreline around this time, suggesting displaced populations moved into Mesopotamia.\n\nc. 5400 BC – Eridu, in southern Mesopotamia (modern Iraq), is founded during the Ubaid period. According to excavation, Eridu was built on virgin sand dunes near what was then the shoreline of the Persian Gulf. It becomes one of the earliest known cities in the world."
              },
              {
                title: "The Rise of Civilization and Early Flood Records",
                content: "c. 4000–3000 BC – Rapid growth of civilizations: In Mesopotamia, the Uruk period sees the emergence of large urban centers (e.g. Uruk itself) and the invention of writing (cuneiform) by the late 4th millennium BC. Eridu continues to be inhabited and remains an important religious center. In Northeast Africa, Predynastic Egypt develops along the Nile. Small villages coalesce into larger entities; by c. 3100 BC, King Narmer (Menes) unifies Upper and Lower Egypt, founding the First Dynasty and beginning the Early Dynastic Period.\n\nc. 2900 BC – Traditional date for a great flood in Mesopotamia. Archaeologists have found a distinctive 60 cm layer of mud and silt at the city of Shuruppak (Tell Fara) separating Jemdet Nasr and Early Dynastic strata, indicating a major flood event. Similar flood layers are noted at other Mesopotamian sites (though not all at the same date, consistent with periodic river floods).\n\nc. 2650 BC – The Egyptian architect Imhotep designs the Step Pyramid of Djoser at Saqqara, marking the first monumental stone pyramid. This marvel of engineering (approximately 60 m tall, with six tiers) inaugurates the age of pyramid-building in Egypt.\n\nc. 2600–2500 BC – Height of Old Kingdom Egypt. Pharaohs Sneferu, Khufu, Khafre, Menkaure build the great pyramids. The Great Pyramid of Giza (Khufu's pyramid, c. 2550 BC) stands as the largest and most precisely constructed pyramid, aligned almost perfectly to the cardinal directions. These early pyramids showcase advanced architectural knowledge (massive scale, precise cut stone masonry) that later generations did not surpass.\n\nc. 2400–1800 BC – Mesopotamian scribes record the flood myths in writing. The Sumerian Eridu Genesis (earliest version c. 17th century BC) tells of Ziusudra and the flood, while the Old Babylonian Epic of Atrahasis (c. eighteenth century BC) and later the Epic of Gilgamesh (flood story in Tablet XI, recorded by ~1200 BC from earlier sources) preserve the tale of Utnapishtim."
              },
              {
                title: "Flood Myths Across Cultures and Mysterious Construction",
                content: "The Mesopotamian accounts describe a great flood sent by the gods to destroy humanity. In the Epic of Gilgamesh, the hero meets the survivor Utnapishtim who tells how Ea (Enki), the god of wisdom, warned him to build a boat and save his family and animals. Following a seven-day flood that destroyed mankind, the boat landed on a mountain, and Utnapishtim released birds to find dry land.\n\nThe Hebrew Bible's account of Noah's Ark (recorded ~6th century BC but based on older traditions) parallels the Mesopotamian versions in many details, including the divine warning, the ark's construction, the animals, the mountain landing, and the bird releases. This account was later inherited by Christianity and Islam.\n\nAcross the world, over 200 different flood myths exist, from ancient China (Yu the Great) and India (Manu) to the Americas (Maya, Hopi) and Pacific Islands. While some may reflect local flooding, the striking similarities in myths worldwide have led some to suggest they preserve a memory of catastrophic post-glacial sea level rise.\n\nThe construction techniques used in the oldest monuments of Egypt and Mesopotamia reveal a level of sophistication that has puzzled archaeologists. In Egypt, the Great Pyramid of Giza (c. 2550 BC) features stones weighing up to 80 tons fitted with sub-millimeter precision. Without modern technology, moving and placing such massive blocks with this level of accuracy remains an engineering marvel.\n\nSimilarly, ancient Mesopotamian ziggurats like the one at Ur featured complex drainage systems and precisely laid brickwork on a monumental scale. The earliest temples of Eridu show remarkable structural understanding from the very beginning of the architectural record.\n\nThese achievements raise questions about how such advanced techniques emerged so early in civilization's development. Some researchers suggest these societies inherited architectural knowledge from earlier, unrecorded cultures."
              },
              {
                title: "Advanced Ancient Knowledge: Mathematics and Astronomy",
                content: "The mathematical understanding demonstrated by ancient Mesopotamians and Egyptians appears surprisingly sophisticated from very early periods. Babylonian clay tablets (c. 1800-1600 BC) show knowledge of Pythagorean triples a thousand years before Pythagoras. The famous Plimpton 322 tablet displays complex numerical relationships and possibly trigonometric functions.\n\nIn Egypt, the Rhind Mathematical Papyrus (c. 1650 BC) demonstrates sophisticated understanding of geometry, algebra, and arithmetical operations. The dimensions of the Great Pyramid incorporate mathematical principles including π (pi) to a remarkable degree of accuracy.\n\nThe question remains: how did these early civilizations develop such mathematical sophistication so rapidly after transitioning from simple agricultural communities?\n\nMany ancient monuments demonstrate precise astronomical alignments that required detailed celestial observations over extended periods. The Great Pyramid's sides are aligned to the cardinal directions with an accuracy of 0.05 degrees. Monuments like Nabta Playa in Egypt (c. 7000 BC) and Göbekli Tepe in Turkey (c. 9500 BC) show astronomical alignments predating written history.\n\nIn Mesopotamia, the earliest ziggurats were carefully oriented to celestial phenomena. Ancient texts reveal detailed knowledge of astronomical cycles, including the 25,920-year precession of the equinoxes, a phenomenon requiring generational observation to detect.\n\nThe sophistication of these astronomical observations and their integration into monumental architecture suggests a transfer of knowledge across generations that predates our conventional understanding of civilization's development."
              },
              {
                title: "Early Writing, Navigation, and Cultural Memory",
                content: "The emergence of writing systems in Mesopotamia (cuneiform) and Egypt (hieroglyphics) around 3200-3000 BC shows remarkable sophistication from their earliest appearances. Both systems emerged nearly fully-formed, with over 1,000 distinct signs in early Egyptian hieroglyphics and hundreds of cuneiform symbols.\n\nEarly tablets from Uruk (c. 3300 BC) already show a complex accounting system and administrative organization. The traditional view that writing evolved slowly from simple pictograms is challenged by evidence suggesting these systems were implemented rather suddenly with already established conventions.\n\nSome scholars propose that these writing systems may have developed from earlier proto-writing or symbolic systems that haven't survived in the archaeological record, suggesting a longer developmental period than conventionally understood.\n\nEvidence suggests ancient cultures possessed sophisticated navigational knowledge and possibly maps that indicated distant lands. Mesopotamian world maps like the Babylonian Map of the World (c. 600 BC) show conceptual understanding of geographical relationships. Egyptian trading expeditions to distant lands like Punt demonstrate navigational abilities that would require considerable knowledge.\n\nPolynesian navigators crossed thousands of miles of open ocean using sophisticated star navigation techniques, wave patterns, and other natural signals. These navigational traditions were passed down through oral histories dating back thousands of years.\n\nSome controversial interpretations of ancient maps, such as the Piri Reis map (1513 AD, claimed to be based on much older sources), suggest knowledge of coastlines that were only visible before post-glacial sea level rise, though these claims remain highly debated in mainstream scholarship.\n\nAncient myths often preserve cultural memories of historical events and transitions, though wrapped in supernatural narratives. The Sumerian King List records incredibly long reigns for early kings, with a clear division between kings \"before the flood\" and more historical rulers after. Egyptian traditions similarly spoke of a time when gods ruled directly before human pharaohs.\n\nPlato's account of Atlantis (4th century BC) describes an advanced civilization destroyed by flooding \"in a single day and night of misfortune\" causing it to sink beneath the sea. While considered allegorical by most scholars, some have suggested it might preserve cultural memory of catastrophic flooding at the end of the Ice Age.\n\nComparative mythology reveals consistent themes across cultures about a previous \"golden age\" of humanity followed by decline, often associated with floods or other catastrophes. These persistent motifs raise questions about whether such myths preserve dim memories of actual historical transitions."
              },
              {
                title: "Submerged Evidence and Rethinking Our Past",
                content: "The dramatic rise in sea levels at the end of the last Ice Age (c. 15,000-8,000 years ago) transformed coastlines worldwide, submerging vast areas of previously habitable land. The most dramatic period, Meltwater Pulse 1A (c. 14,000 years ago), saw sea levels rise approximately 20 meters in just 500 years.\n\nMarine archaeology has discovered numerous submerged sites worldwide, including settlements in the Persian Gulf, North Sea, Mediterranean, and Indian Ocean. Notable examples include Pavlopetri off Greece (submerged c. 3000 BC) and Dwarka off India's western coast.\n\nGeological studies of the Persian Gulf indicate it was a fertile river valley until about 8,000 years ago when rising seas flooded it completely. Intriguingly, this timeframe aligns with Mesopotamian flood accounts and the sudden appearance of developed settlements in southern Mesopotamia.\n\nThe discovery of Göbekli Tepe in southeastern Turkey has forced archaeologists to reconsider conventional timelines of civilization's development. Dated to approximately 9500 BC, this monumental complex predates pottery, metallurgy, writing, and even agriculture.\n\nThe site features massive T-shaped pillars weighing up to 20 tons, arranged in circles and decorated with sophisticated animal carvings. The construction required coordinated labor from hundreds of individuals at a time when humans were supposedly simple hunter-gatherers.\n\nPerhaps most mysteriously, after being in use for approximately 2,000 years, the entire complex was deliberately buried under thousands of tons of soil around 8000 BC. The purpose of this burial remains unknown, as does the full purpose of the site itself, though evidence suggests it was primarily ceremonial rather than residential.\n\nThe conventional narrative of human civilization—emerging slowly from simple agricultural beginnings around 10,000 years ago—is increasingly challenged by archaeological discoveries and interdisciplinary research. The sophisticated knowledge demonstrated in the earliest known civilizations of Mesopotamia and Egypt suggests they may have inherited wisdom from earlier cultures.\n\nThe geological record confirms dramatic climate and sea level changes at the end of the last Ice Age, potentially disrupting coastal settlements worldwide. Flood myths across cultures may preserve memories of these traumatic transitions, while the sudden emergence of advanced civilizations in the archaeological record might represent the reorganization of human societies after catastrophic disruption.\n\nWhile speculative elements remain in these alternative interpretations of prehistory, the growing body of evidence suggests our understanding of human civilization's earliest chapters continues to evolve as new discoveries challenge old assumptions."
              }
            ]
          };
          
          setScrollData(scrollData);
          console.log("Successfully loaded scroll data:", scrollData.title);
        } else {
          try {
            const response = await fetch(`/api/scrolls/${scrollId}`);
            
            if (!response.ok) {
              console.error("Fetch error status:", response.status);
              throw new Error("Failed to fetch sacred scroll data");
            }
            
            const scroll = await response.json();
            
            // For now, let's just use a simple structure for most scrolls
            const simpleScrollData: ScrollData = {
              title: scroll.title,
              pages: [
                {
                  title: scroll.title,
                  content: scroll.content
                }
              ]
            };
            
            setScrollData(simpleScrollData);
          } catch (error) {
            console.error("API fetch error:", error);
            console.log("Not the Legacy scroll, redirecting to scrolls page");
            navigate('/scrolls');
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching scroll data:", error instanceof Error ? error.message : 'Unknown error');
        console.error("Full error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [scrollId, navigate]);
  
  const goToNextPage = () => {
    if (scrollData && currentPage < scrollData.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sacred-light">
        <div className="w-12 h-12 border-4 border-sacred-blue rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (!scrollData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sacred-light">
        <h1 className="text-2xl font-cinzel text-sacred-blue mb-4">Scroll Not Found</h1>
        <p className="text-sacred-gray mb-6">The sacred text you seek may be hidden in deeper chambers.</p>
        <Link to="/scrolls">
          <Button variant="outline" className="font-cinzel">
            Return to Scrolls
          </Button>
        </Link>
      </div>
    );
  }
  
  const currentPageData = scrollData.pages[currentPage];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-8 px-4 bg-sacred-light"
    >
      <Helmet>
        <title>{`${scrollData.title} | Page ${currentPage + 1} of ${scrollData.pages.length} | The Akashic Archive`}</title>
        <meta name="description" content={`Reading ${scrollData.title}: ${currentPageData.title}. An ancient scroll from the Akashic Archives.`} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/scrolls" className="inline-flex items-center text-sacred-blue hover:text-sacred-blue-dark mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="font-cinzel">Return to Scrolls</span>
        </Link>
        
        {/* Scroll container with white background */}
        <div 
          className="relative rounded-lg overflow-hidden shadow-xl mb-8 bg-white"
        >
          
          {/* Content */}
          <div className="relative p-8 md:p-12">
            {/* Main title (shown only on first page) */}
            {currentPage === 0 && (
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-cinzel text-sacred-blue text-center mb-8"
              >
                {scrollData.title}
              </motion.h1>
            )}
            
            {/* Page title */}
            <motion.h2 
              key={`title-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl font-cinzel text-sacred-blue-dark mb-6"
            >
              {currentPageData.title}
            </motion.h2>
            
            {/* Page content */}
            <motion.div 
              key={`content-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="prose prose-lg max-w-none font-serif text-sacred-gray-dark"
            >
              {currentPageData.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </motion.div>
            
            {/* Page number indicator */}
            <div className="text-center mt-8 font-cinzel text-sacred-blue-light">
              Page {currentPage + 1} of {scrollData.pages.length}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-12">
          <Button 
            variant="outline"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === scrollData.pages.length - 1}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            Next Page
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}