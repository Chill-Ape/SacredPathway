// Add example content for each content type (tablet, artifact, scroll, book)
import { db, pool } from "../server/db";
import { scrolls, InsertScroll } from "../shared/schema";

async function addContentTypes() {
  console.log("Adding example content for each content type...");

  // Example content for each type
  const contentItems: InsertScroll[] = [
    // Tablet
    {
      title: "The Forbidden Cuneiform Tablet",
      content: 
        "This ancient tablet contains mysterious cuneiform inscriptions that appear to document an advanced civilization predating known history. Archaeological analysis suggests it originates from a period before the Sumerian civilization, challenging conventional timelines. The inscriptions describe astronomical observations with uncanny precision, including references to celestial bodies not officially discovered until modern times.\n\n" +
        "The second portion of the text appears to detail advanced mathematical concepts, including calculations that resemble modern equations for gravitational forces and planetary movements. Scholars remain divided on its authenticity, with some suggesting it represents evidence of knowledge transfer from an earlier, technologically advanced society.\n\n" +
        "The final section contains warnings about celestial events and their earthly consequences, with particular emphasis on a recurring cycle of cataclysms. Carbon dating places the tablet at approximately 10,000 BCE, though this remains contested within academic circles.",
      image: "/assets/content-types/ancient_tablet.png",
      isLocked: true,
      key: "PRIMORDIAL_KNOWLEDGE",
      type: "tablet"
    },
    // Artifact
    {
      title: "The Crystalline Resonator",
      content: 
        "This remarkable crystalline artifact was discovered deep within a remote cavern system, where it had remained untouched for millennia. Composed of an unknown translucent material that exhibits unusual vibrational properties, the resonator appears to amplify certain frequencies when exposed to specific light conditions.\n\n" +
        "Initial testing revealed that when placed in alignment with specific stellar bodies, the artifact produces a harmonic frequency that affects the electromagnetic field surrounding it. More surprisingly, the internal structure displays a geometric arrangement remarkably similar to modern microprocessor architecture, raising profound questions about its origin and purpose.\n\n" +
        "The surface contains microscopic etchings – precise mathematical sequences and geometric patterns that some researchers suggest represent a form of data storage. Attempts to decode these patterns have yielded fragmentary information about energy manipulation techniques far beyond conventional understanding.\n\n" +
        "The artifact's purpose remains enigmatic, though some esoteric scholars suggest it may have functioned as a communication device or energy amplifier within an ancient technological system now lost to history.",
      image: "/assets/content-types/crystal_artifact.jpg",
      isLocked: true,
      key: "CRYSTAL_FREQUENCY",
      type: "artifact"
    },
    // Scroll
    {
      title: "The Celestial Concordance",
      content: 
        "This remarkably preserved scroll contains detailed astronomical observations spanning centuries, meticulously recorded by an unknown ancient order. The parchment, crafted from an unidentified material resistant to decay, chronicles the alignment of cosmic bodies and their influence on terrestrial energies.\n\n" +
        "The text describes a complex system of celestial mechanics that appears to predict astronomical events with astonishing accuracy. Particularly noteworthy are references to cyclic cosmic phenomena occurring over vast timescales – patterns only recently confirmed by modern astronomical observations.\n\n" +
        "The central portion details ritualistic practices designed to harness cosmic alignments, including mathematical formulations that show surprising correlation to modern quantum field theory equations. The final section contains prophecies regarding a specific stellar alignment – one that modern calculations indicate will occur within this century.\n\n" +
        "Most intriguing are the scroll's references to an ancient civilization said to have achieved harmony with these cosmic cycles, harnessing energies beyond current scientific understanding. Their knowledge, according to the text, was scattered across the world in sacred repositories following a great cataclysm, preserved for rediscovery when humanity reached sufficient understanding to utilize it responsibly.",
      image: "/assets/content-types/enchanted_scroll.jpg",
      isLocked: true,
      key: "COSMIC_ALIGNMENT",
      type: "scroll"
    },
    // Book
    {
      title: "Codex of Forgotten Sciences",
      content: 
        "This extraordinary leather-bound tome contains knowledge from an advanced civilization that appears to have existed during what conventional history considers prehistory. The pages, composed of an unknown fibrous material, contain diagrams and formulations describing principles of energy manipulation, consciousness transformation, and matter transmutation.\n\n" +
        "The early chapters outline a comprehensive cosmological model that bears striking resemblance to cutting-edge theoretical physics concepts, including multidimensional space-time structures and non-local quantum interactions. The precision of these descriptions suggests an understanding of natural law that in some areas exceeds modern scientific knowledge.\n\n" +
        "The middle section details methodologies for conscious interaction with the fabric of reality itself – techniques for manipulating energy fields through focused mental intention, supported by geometric configurations that modern analysis reveals to be mathematically perfect amplification structures.\n\n" +
        "Most controversial are the final chapters, which describe technologies utilizing principles currently deemed theoretical or impossible – including methods for gravity manipulation, instantaneous communication across vast distances, and the transformation of consciousness beyond physical limitations.\n\n" +
        "Linguistic analysis suggests the text was created as a compilation of knowledge from an even older civilization, preserved by an order dedicated to safeguarding this wisdom until humanity redeveloped the ethical framework necessary for its responsible application.",
      image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png",
      isLocked: true,
      key: "ANCIENT_WISDOM",
      type: "book"
    }
  ];

  try {
    // First check if any of these items already exist
    for (const item of contentItems) {
      // Simple check for existing items - just check exact titles
      const existingItems = await db.select().from(scrolls).where(scroll => ({ 
        title: item.title 
      }));
      
      if (existingItems.length === 0) {
        // Insert new content
        const [insertedItem] = await db.insert(scrolls).values(item).returning();
        console.log(`Added ${item.type}: ${item.title} with ID ${insertedItem.id}`);
      } else {
        console.log(`${item.type}: ${item.title} already exists, skipping`);
      }
    }

    console.log("Content creation complete!");
  } catch (error) {
    console.error("Error adding content:", error);
  } finally {
    // Close the database connection
    if (pool) await pool.end();
  }
}

// Execute the function
addContentTypes().catch(console.error);