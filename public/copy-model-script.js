// This script attempts to copy the burger model to various locations for the viewer to find
document.addEventListener('DOMContentLoaded', function() {
  console.log('Attempting to locate and copy the burger model file...');
  
  // List of possible source paths
  const sourcePaths = [
    '/client/src/assets/3d objects/uploads_files_2465920_burger_merged.glb',
    '/attached_assets/uploads_files_2465920_burger_merged.glb',
    '/public/burger_models/uploads_files_2465920_burger_merged.glb'
  ];
  
  // List of destination paths to copy to
  const destPaths = [
    '/burger_models/burger.glb',
    '/basic-models/burger.glb',
    '/burger_model.glb',
    '/3d_burger.glb'
  ];
  
  // Function to attempt copy (this will only work if CORS allows it)
  async function attemptCopy(sourcePath) {
    try {
      console.log(`Attempting to fetch from ${sourcePath}...`);
      const response = await fetch(sourcePath);
      
      if (!response.ok) {
        console.log(`Failed to fetch from ${sourcePath}: ${response.status}`);
        return null;
      }
      
      console.log(`Successfully fetched from ${sourcePath}!`);
      return await response.blob();
    } catch (error) {
      console.error(`Error fetching from ${sourcePath}:`, error);
      return null;
    }
  }
  
  // Main function to try copying from each source to each destination
  async function tryAllCopies() {
    let modelBlob = null;
    
    // Try to get the model from each source path
    for (const sourcePath of sourcePaths) {
      modelBlob = await attemptCopy(sourcePath);
      if (modelBlob) {
        console.log(`Found model at ${sourcePath}`);
        break;
      }
    }
    
    if (!modelBlob) {
      console.error('Could not find the model file in any of the source locations.');
      return;
    }
    
    // Try to "copy" (by creating object URLs) to each destination
    for (const destPath of destPaths) {
      try {
        const objectUrl = URL.createObjectURL(modelBlob);
        console.log(`Created object URL for ${destPath}: ${objectUrl}`);
        
        // Store in sessionStorage for the viewer to find
        sessionStorage.setItem(`burger_model_${destPath.replace(/[^a-zA-Z0-9]/g, '_')}`, objectUrl);
        
        // We can't actually write to the filesystem from the browser, but we store these URLs
        // for the model viewer script to check
      } catch (error) {
        console.error(`Error creating object URL for ${destPath}:`, error);
      }
    }
    
    console.log('Finished attempting to copy the model file.');
  }
  
  // Run the copy attempt
  tryAllCopies();
});