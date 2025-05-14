
import { supabase } from "@/integrations/supabase/client";
import { EqReflectionItem, EqReflection } from "@/components/ui/eq-reflection-card";

// Retrieve today's reflection data if it exists
export async function getTodaysReflection() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    return null; // Return null if user is not authenticated
  }
  
  const userId = session.session.user.id;
  
  const { data, error } = await supabase
    .from('eq_reflections')
    .select('*')
    .eq('date', today)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching today\'s reflection:', error);
    throw error;
  }
  
  return data;
}

// Save the complete reflection object
export async function saveReflection(reflection: Partial<EqReflection>) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current user's ID
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User must be authenticated to save reflections');
  }
  
  const userId = session.session.user.id;
  
  // Check if a reflection for today already exists
  const { data: existingData, error: checkError } = await supabase
    .from('eq_reflections')
    .select('id')
    .eq('date', today)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking for existing reflection:', checkError);
    throw checkError;
  }
  
  // Prepare the data to be stored - serialize complex objects to JSON strings
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
    user_id: userId
  };
  
  if (reflection.empathy) {
    updateData.empathy = typeof reflection.empathy === 'string' 
      ? reflection.empathy 
      : JSON.stringify(reflection.empathy);
  }
  
  if (reflection.social_skills) {
    updateData.social_skills = typeof reflection.social_skills === 'string'
      ? reflection.social_skills
      : JSON.stringify(reflection.social_skills);
  }
  
  if (reflection.self_regulation) {
    updateData.self_regulation = typeof reflection.self_regulation === 'string'
      ? reflection.self_regulation
      : JSON.stringify(reflection.self_regulation);
  }
  
  if (reflection.self_awareness) {
    updateData.self_awareness = typeof reflection.self_awareness === 'string'
      ? reflection.self_awareness
      : JSON.stringify(reflection.self_awareness);
  }
  
  // Update or insert the reflection
  if (existingData) {
    // Update existing reflection
    const { data, error } = await supabase
      .from('eq_reflections')
      .update(updateData)
      .eq('id', existingData.id)
      .select();
      
    if (error) {
      console.error('Error updating reflection:', error);
      throw error;
    }
    
    return data;
  } else {
    // Create new reflection
    updateData.date = today;
    
    const { data, error } = await supabase
      .from('eq_reflections')
      .insert([updateData])
      .select();
      
    if (error) {
      console.error('Error creating reflection:', error);
      throw error;
    }
    
    return data;
  }
}

// Update a single reflection item
export async function updateReflectionItem(type: string, item: EqReflectionItem) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current user's ID
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User must be authenticated to update reflections');
  }
  
  const userId = session.session.user.id;
  
  // Check if a reflection for today already exists
  const { data: existingData, error: checkError } = await supabase
    .from('eq_reflections')
    .select(`id, ${type}`)
    .eq('date', today)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking for existing reflection:', checkError);
    throw checkError;
  }
  
  const serializedItem = JSON.stringify(item);
  
  // Update or insert the reflection
  if (existingData) {
    // Update existing reflection
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    updateData[type] = serializedItem;
    
    const { data, error } = await supabase
      .from('eq_reflections')
      .update(updateData)
      .eq('id', existingData.id as string)
      .select();
      
    if (error) {
      console.error('Error updating reflection item:', error);
      throw error;
    }
    
    return data;
  } else {
    // Create new reflection with just this field
    const insertData = { 
      date: today,
      user_id: userId,
      [type]: serializedItem
    };
    
    const { data, error } = await supabase
      .from('eq_reflections')
      .insert([insertData])
      .select();
      
    if (error) {
      console.error('Error creating reflection item:', error);
      throw error;
    }
    
    return data;
  }
}
