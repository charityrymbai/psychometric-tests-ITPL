/**
 * Utility functions for tag handling in question generation
 */

export type Tag = {
  id: number;
  name: string;
  description?: string;
};

export type GeneratedTag = {
  temp_id: string;
  name: string;
  description?: string;
  isNew?: boolean;
};

export type QuestionOption = {
  text: string;
  tag_id?: number | null;
  temp_tag_id?: string;
  tag_name?: string;
  tag_name_display?: string;
  is_suggested_tag?: boolean;
};

/**
 * Map options with tag_name to the corresponding tag
 * This is the central function for tag mapping
 */
export function mapOptionsToTags(
  options: QuestionOption[],
  existingTags: Tag[] = [],
  suggestedTags: GeneratedTag[] = [],
  defaultAssignment: boolean = true
): QuestionOption[] {
  console.log('mapOptionsToTags called with:', {
    optionsCount: options.length,
    existingTagsCount: existingTags.length,
    suggestedTagsCount: suggestedTags.length,
    defaultAssignment
  });

  // Create fast lookup maps
  const existingTagMap = new Map<string, Tag>();
  existingTags.forEach(tag => {
    existingTagMap.set(tag.name.toLowerCase(), tag);
  });

  const suggestedTagMap = new Map<string, GeneratedTag>();
  suggestedTags.forEach(tag => {
    suggestedTagMap.set(tag.name.toLowerCase(), tag);
  });

  // For debugging
  console.log('Tag maps created:', {
    existingTagNames: Array.from(existingTagMap.keys()),
    suggestedTagNames: Array.from(suggestedTagMap.keys())
  });

  return options.map((option, index) => {
    // Copy the option to avoid mutating the original
    const updatedOption = { ...option };
    
    // If option already has a valid tag ID, keep it
    if (updatedOption.tag_id !== undefined && updatedOption.tag_id !== null) {
      console.log(`Option ${index} already has tag_id: ${updatedOption.tag_id}`);
      return updatedOption;
    }
    
    if (updatedOption.temp_tag_id) {
      console.log(`Option ${index} already has temp_tag_id: ${updatedOption.temp_tag_id}`);
      return updatedOption;
    }
    
    // Use tag_name from the API or tag_name_display from previous processing
    const tagName = updatedOption.tag_name || updatedOption.tag_name_display;
    
    if (tagName) {
      console.log(`Option ${index} has tag name: "${tagName}"`);
      const tagNameLower = tagName.toLowerCase();
      
      // First try to find in suggested tags
      const suggestedTag = suggestedTagMap.get(tagNameLower);
      if (suggestedTag) {
        console.log(`Found matching suggested tag: ${suggestedTag.name} (${suggestedTag.temp_id})`);
        return {
          ...updatedOption,
          tag_id: null,
          temp_tag_id: suggestedTag.temp_id,
          tag_name_display: tagName,
          is_suggested_tag: true
        };
      }
      
      // Then try existing tags
      const existingTag = existingTagMap.get(tagNameLower);
      if (existingTag) {
        console.log(`Found matching existing tag: ${existingTag.name} (${existingTag.id})`);
        return {
          ...updatedOption,
          tag_id: existingTag.id,
          temp_tag_id: undefined,
          tag_name_display: tagName
        };
      }
      
      console.log(`No matching tag found for "${tagName}"`);
    }
    
    // If no tag found and default assignment is enabled
    if (defaultAssignment) {
      const allTags = [...existingTags, ...suggestedTags];
      if (allTags.length > 0) {
        const tagIndex = index % allTags.length;
        const tag = allTags[tagIndex];
        
        if ('id' in tag && typeof tag.id === 'number') {
          console.log(`Auto-assigning existing tag: ${tag.name} (${tag.id})`);
          return {
            ...updatedOption,
            tag_id: tag.id,
            temp_tag_id: undefined,
            tag_name_display: tag.name
          };
        } else if ('temp_id' in tag) {
          console.log(`Auto-assigning generated tag: ${tag.name} (${tag.temp_id})`);
          return {
            ...updatedOption,
            tag_id: null,
            temp_tag_id: tag.temp_id,
            tag_name_display: tag.name,
            is_suggested_tag: true
          };
        }
      }
    }
    
    // No tag assigned
    console.log(`No tag assigned for option ${index}`);
    return updatedOption;
  });
}

/**
 * Generate a temporary ID for a tag
 */
export function generateTempTagId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create GeneratedTag objects from API suggested tags
 */
export function createGeneratedTagsFromSuggestions(
  suggestedTags: any[],
  existingTagsCount: number
): GeneratedTag[] {
  // Only add tags if we have fewer than 4 total
  if (existingTagsCount >= 4) {
    console.log('Already have 4 or more tags, not adding suggested tags');
    return [];
  }
  
  // Limit to only add enough to reach a total of 4 tags
  const maxNewTags = 4 - existingTagsCount;
  const tagsToAdd = suggestedTags.slice(0, maxNewTags);
  
  // Create new temporary tags
  return tagsToAdd.map(tag => ({
    temp_id: generateTempTagId(),
    name: tag.name,
    description: tag.description || '',
    isNew: true
  }));
}
