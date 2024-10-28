import ApiService from "./../services/apiService";

export interface ClarifyRequirementsParams {
  budget: string;
  amenities: string[];
  moveInDate: string;
  familySize: number;
}

export interface RentalItem {
  address: string;
  reason: string;
  score: number;
  summary_of_review: string;
}

const RentalService = {
  clarifyRequirements: async function(params: ClarifyRequirementsParams): Promise<RentalItem[]> {
    try {
      const response = await ApiService.post('/api/clarify_requirements/', JSON.stringify({
        budget: params.budget,
        amenities: params.amenities.join(', '),
        move_in_date: params.moveInDate,
        family_size: params.familySize
      }));

      return response as RentalItem[];
    } catch (error) {
      console.error('Error in clarifyRequirements:', error);
      throw error;
    }
  }
};

export default RentalService;