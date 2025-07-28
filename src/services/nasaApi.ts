const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_IMAGE_URL = 'https://images-api.nasa.gov/search';

export interface APODData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

export interface NASAImageItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumb: string;
  date: string;
  center: string;
  keywords: string[];
}

export class NASAApiService {
  static async getAPOD(date?: string): Promise<APODData> {
    const url = new URL(NASA_APOD_URL);
    
    // Only add API key if it's not DEMO_KEY
    if (NASA_API_KEY && NASA_API_KEY !== 'DEMO_KEY') {
      url.searchParams.append('api_key', NASA_API_KEY);
    } else {
      url.searchParams.append('api_key', 'DEMO_KEY');
    }
    
    if (date) {
      url.searchParams.append('date', date);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`NASA APOD API error: ${response.status}`);
    }

    return await response.json();
  }

  static async getRandomAPOD(): Promise<APODData> {
    const url = new URL(NASA_APOD_URL);
    
    // Only add API key if it's not DEMO_KEY
    if (NASA_API_KEY && NASA_API_KEY !== 'DEMO_KEY') {
      url.searchParams.append('api_key', NASA_API_KEY);
    } else {
      url.searchParams.append('api_key', 'DEMO_KEY');
    }
    
    url.searchParams.append('count', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`NASA APOD API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0];
  }

  static async searchImages(query: string, count: number = 20): Promise<NASAImageItem[]> {
    const url = new URL(NASA_IMAGE_URL);
    url.searchParams.append('q', query);
    url.searchParams.append('media_type', 'image');
    url.searchParams.append('page_size', count.toString());

    // NASA Image API doesn't require API key
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`NASA Image API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.collection?.items || [];

    return items.map((item: any) => {
      const imageData = item.data?.[0] || {};
      const links = item.links || [];
      const imageLink = links.find((link: any) => link.rel === 'preview') || links[0];

      return {
        id: imageData.nasa_id || item.href,
        title: imageData.title || 'NASA Image',
        description: imageData.description || '',
        url: imageLink?.href || '',
        thumb: imageLink?.href || '',
        date: imageData.date_created || '',
        center: imageData.center || 'NASA',
        keywords: imageData.keywords || []
      };
    });
  }

  static async getCosmicQuizData(): Promise<{question: string, options: string[], correct: number, image: NASAImageItem}> {
    const cosmicTerms = [
      'nebula', 'galaxy', 'supernova', 'black hole', 'pulsar', 
      'quasar', 'asteroid', 'comet', 'mars', 'jupiter'
    ];
    
    const randomTerm = cosmicTerms[Math.floor(Math.random() * cosmicTerms.length)];
    const images = await this.searchImages(randomTerm, 5);
    
    if (images.length === 0) {
      throw new Error('No quiz data available');
    }

    // Pick a random image from the results
    const image = images[Math.floor(Math.random() * images.length)];
    const correctAnswer = randomTerm.charAt(0).toUpperCase() + randomTerm.slice(1);
    
    // Generate wrong options
    const wrongOptions = cosmicTerms
      .filter(term => term !== randomTerm)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(term => term.charAt(0).toUpperCase() + term.slice(1));

    const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(correctAnswer);

    return {
      question: `What cosmic object or phenomenon is shown in this NASA image?`,
      options,
      correct: correctIndex,
      image
    };
  }

  static async getMissionImages(missions: string[] = ['apollo', 'mars rover', 'hubble', 'voyager']): Promise<NASAImageItem[]> {
    const allMissionImages: NASAImageItem[] = [];
    
    for (const mission of missions) {
      try {
        const images = await this.searchImages(mission, 6);
        allMissionImages.push(...images);
      } catch (error) {
        console.error(`Failed to load images for mission: ${mission}`, error);
      }
    }
    
    return allMissionImages;
  }

  static async getCategoryImages(category: string, count: number = 20): Promise<NASAImageItem[]> {
    return await this.searchImages(category, count);
  }

  static async getRandomSpaceImages(count: number = 24): Promise<NASAImageItem[]> {
    const spaceTerms = ['space', 'cosmos', 'universe', 'stellar', 'cosmic'];
    const randomTerm = spaceTerms[Math.floor(Math.random() * spaceTerms.length)];
    return await this.searchImages(randomTerm, count);
  }
}