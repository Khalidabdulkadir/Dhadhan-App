// Safe Analytics Mock for Development/Expo Go
// import analytics from '@react-native-firebase/analytics'; 

// Mock implementation to prevent crashes in Expo Go
const logEvent = async (name: string, params: Record<string, any> = {}) => {
    try {
        console.log(`✅ [Analytics Mock] Event: ${name}`, params);
        // await analytics().logEvent(name, params);
    } catch (error) {
        console.warn(`[Analytics] Error:`, error);
    }
};

export { logEvent };

export const logRestaurantView = async (restaurantId: number, restaurantName: string) => {
    await logEvent('view_restaurant', {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
    });
};

export const logOrderClick = async (restaurantId: number, orderDetails: any) => {
    await logEvent('click_order', {
        restaurant_id: restaurantId,
        ...orderDetails,
    });
};

export const logScreenView = async (screenName: string) => {
    console.log(`📱 [Analytics Mock] Screen View: ${screenName}`);
    // await analytics().logScreenView({
    //     screen_name: screenName,
    //     screen_class: screenName,
    // });
};
