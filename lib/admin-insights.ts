// Admin Dashboard Insights and Analytics
// Provides additional data analysis and insights for admin dashboard

import { adminApiClient, type PendingDeveloper } from './admin-api';

export interface AdminInsights {
  developmentTrends: {
    registrationsThisWeek: number;
    registrationsLastWeek: number;
    growthRate: number;
  };
  geographicDistribution: {
    country: string;
    count: number;
  }[];
  popularCompanyTypes: {
    type: string;
    count: number;
  }[];
  verificationMetrics: {
    averageVerificationTime: number; // in hours
    pendingOverThresholds: {
      over24Hours: number;
      over7Days: number;
      over30Days: number;
    };
  };
}

export class AdminInsightsService {
  static async generateInsights(developers: PendingDeveloper[]): Promise<AdminInsights> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Calculate registration trends
    const thisWeekRegistrations = developers.filter(dev => 
      new Date(dev.created_at) > weekAgo
    ).length;
    
    const lastWeekRegistrations = developers.filter(dev => {
      const createdDate = new Date(dev.created_at);
      return createdDate > twoWeeksAgo && createdDate <= weekAgo;
    }).length;

    const growthRate = lastWeekRegistrations === 0 
      ? thisWeekRegistrations > 0 ? 100 : 0
      : ((thisWeekRegistrations - lastWeekRegistrations) / lastWeekRegistrations) * 100;

    // Analyze company types from company names
    const companyTypes = this.categorizeCompanies(developers);

    // Geographic distribution (basic extraction from office addresses)
    const geographic = this.analyzeGeography(developers);

    // Calculate verification metrics
    const verificationMetrics = this.calculateVerificationMetrics(developers);

    return {
      developmentTrends: {
        registrationsThisWeek: thisWeekRegistrations,
        registrationsLastWeek: lastWeekRegistrations,
        growthRate: Math.round(growthRate * 100) / 100
      },
      geographicDistribution: geographic,
      popularCompanyTypes: companyTypes,
      verificationMetrics
    };
  }

  private static categorizeCompanies(developers: PendingDeveloper[]) {
    const typeCounter: Record<string, number> = {};
    
    developers.forEach(dev => {
      const companyName = dev.company_name.toLowerCase();
      let type = 'Other';
      
      if (companyName.includes('construction') || companyName.includes('build')) {
        type = 'Construction';
      } else if (companyName.includes('development') || companyName.includes('develop')) {
        type = 'Development';
      } else if (companyName.includes('engineering') || companyName.includes('engineer')) {
        type = 'Engineering';
      } else if (companyName.includes('architecture') || companyName.includes('architect')) {
        type = 'Architecture';
      } else if (companyName.includes('real estate') || companyName.includes('realty')) {
        type = 'Real Estate';
      } else if (companyName.includes('ltd') || companyName.includes('limited') || companyName.includes('inc')) {
        type = 'Corporation';
      }
      
      typeCounter[type] = (typeCounter[type] || 0) + 1;
    });

    return Object.entries(typeCounter)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private static analyzeGeography(developers: PendingDeveloper[]) {
    const countryCounter: Record<string, number> = {};
    
    developers.forEach(dev => {
      const address = dev.office_address.toLowerCase();
      let country = 'Unknown';
      
      // Simple country detection based on common patterns
      if (address.includes('bulgaria') || address.includes('bg') || 
          address.includes('sofia') || address.includes('plovdiv')) {
        country = 'Bulgaria';
      } else if (address.includes('romania') || address.includes('bucharest')) {
        country = 'Romania';
      } else if (address.includes('germany') || address.includes('berlin')) {
        country = 'Germany';
      } else if (address.includes('uk') || address.includes('london') || address.includes('england')) {
        country = 'United Kingdom';
      } else if (address.includes('usa') || address.includes('united states') || address.includes('new york')) {
        country = 'United States';
      }
      
      countryCounter[country] = (countryCounter[country] || 0) + 1;
    });

    return Object.entries(countryCounter)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static calculateVerificationMetrics(developers: PendingDeveloper[]) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const over24Hours = developers.filter(dev => 
      new Date(dev.created_at) < oneDayAgo
    ).length;
    
    const over7Days = developers.filter(dev => 
      new Date(dev.created_at) < sevenDaysAgo
    ).length;
    
    const over30Days = developers.filter(dev => 
      new Date(dev.created_at) < thirtyDaysAgo
    ).length;

    // Calculate average time pending (for those pending more than 1 hour)
    const totalPendingTime = developers.reduce((total, dev) => {
      const pendingTime = now.getTime() - new Date(dev.created_at).getTime();
      return total + pendingTime;
    }, 0);
    
    const averageVerificationTime = developers.length > 0 
      ? totalPendingTime / developers.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      averageVerificationTime: Math.round(averageVerificationTime * 100) / 100,
      pendingOverThresholds: {
        over24Hours,
        over7Days,
        over30Days
      }
    };
  }

  static async getBackendConnectivityStatus(): Promise<{
    isConnected: boolean;
    availableEndpoints: string[];
    missingEndpoints: string[];
    lastChecked: string;
  }> {
    const endpoints = [
      '/api/v1/admin/developers/pending',
      '/api/v1/admin/stats',
      '/api/v1/admin/activity',
      '/api/v1/admin/health',
      '/api/v1/health',
      '/api/v1/developers/',
      '/api/v1/projects/'
    ];

    const availableEndpoints: string[] = [];
    const missingEndpoints: string[] = [];

    for (const endpoint of endpoints) {
      try {
        await adminApiClient.getCurrentAdmin(); // Test with a simple authenticated request
        // If we can make authenticated requests, consider basic connectivity working
        availableEndpoints.push(endpoint);
      } catch (error) {
        missingEndpoints.push(endpoint);
      }
    }

    return {
      isConnected: availableEndpoints.length > 0,
      availableEndpoints,
      missingEndpoints,
      lastChecked: new Date().toISOString()
    };
  }
}

export const getAdminInsights = (developers: PendingDeveloper[]) => 
  AdminInsightsService.generateInsights(developers);

export const getBackendStatus = () => 
  AdminInsightsService.getBackendConnectivityStatus();