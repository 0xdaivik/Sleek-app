import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PaymentSuccessModal } from '../../src/components/PaymentSuccessModal';
import { useSubscriptionPayment } from '../../src/hooks/useSubscriptionPayment';
import { Subscription as SubscriptionType } from '../../src/services/subscriptionService';
// Make sure to install and link react-native-vector-icons
// import Icon from 'react-native-vector-icons/Feather';

// --- Type Definitions ---
interface Subscription {
  name: string;
  price: number;
  solPrice: number;
  period: string;
  estimated?: boolean;
  region?: string;
}

interface SubscriptionData {
  [key: string]: Subscription[];
}

// --- Comprehensive Subscription Data by Category ---
const subscriptionData: SubscriptionData = {
  'Crypto Analytics': [
    { name: 'TradingView Premium (Annual)', price: 599.40, solPrice: 3.39, period: 'year' },
    { name: 'TradingView Plus', price: 299.40, solPrice: 1.69, period: 'year' },
    { name: 'CoinGecko Premium', price: 99.90, solPrice: 0.57, period: 'year' },
    { name: 'Token Terminal', price: 120, solPrice: 0.68, period: 'year', estimated: true },
    { name: 'CryptoRank Pro', price: 110, solPrice: 0.63, period: 'year', estimated: true },
  ],
  'Productivity': [
    { name: 'Superhuman Email', price: 360, solPrice: 2.04, period: 'year' },
    { name: 'Notion Plus', price: 96, solPrice: 0.54, period: 'year' },
    { name: 'Microsoft 365 Personal', price: 69.99, solPrice: 0.40, period: 'year' },
    { name: 'Grammarly Premium', price: 144, solPrice: 0.81, period: 'year' },
    { name: 'Todoist Pro', price: 36, solPrice: 0.20, period: 'year' },
  ],
  'OTT': [
    { name: 'Netflix (Standard)', price: 72, solPrice: 0.41, period: 'year', region: 'India' },
    { name: 'Disney+ Hotstar Premium', price: 18, solPrice: 0.10, period: 'year', region: 'India' },
    { name: 'Amazon Prime Video', price: 18, solPrice: 0.10, period: 'year', region: 'India' },
    { name: 'Zee5 Premium 4K', price: 15, solPrice: 0.085, period: 'year', region: 'India' },
    { name: 'Sony LIV Premium', price: 12, solPrice: 0.068, period: 'year', region: 'India' },
  ],
  'Music': [
    { name: 'Apple Music Individual', price: 109, solPrice: 0.62, period: 'year' },
    { name: 'Spotify Premium (US)', price: 119.88, solPrice: 0.68, period: 'year' },
    { name: 'Pandora Premium', price: 54.89, solPrice: 0.31, period: 'year' },
    { name: 'YouTube Music Premium', price: 119.88, solPrice: 0.68, period: 'year' },
    { name: 'Tidal HiFi', price: 199.99, solPrice: 1.13, period: 'year' },
  ],
  'Socials': [
    { name: 'LinkedIn Premium Career', price: 239.88, solPrice: 1.36, period: 'year' },
    { name: 'Twitter Blue', price: 84, solPrice: 0.48, period: 'year' },
    { name: 'Discord Nitro', price: 99.99, solPrice: 0.57, period: 'year' },
    { name: 'Reddit Premium', price: 49.99, solPrice: 0.28, period: 'year' },
    { name: 'Pixelfed/Mastodon Pro', price: 60, solPrice: 0.34, period: 'year', estimated: true },
  ],
  'Food & Drinks': [
    { name: 'HelloFresh', price: 2880, solPrice: 16.28, period: 'year' },
    { name: 'EveryPlate', price: 1800, solPrice: 10.18, period: 'year' },
    { name: 'Blue Apron', price: 3120, solPrice: 17.64, period: 'year' },
    { name: 'Green Chef', price: 1750, solPrice: 9.9, period: 'year', estimated: true },
    { name: 'Factor', price: 2500, solPrice: 14.1, period: 'year', estimated: true },
  ],
  'Health': [
    { name: 'BetterHelp Online Therapy', price: 2880, solPrice: 16.28, period: 'year' },
    { name: 'Love.Life Optimize', price: 9000, solPrice: 50.9, period: 'year' },
    { name: 'Extension Health Diagnostic', price: 999, solPrice: 5.65, period: 'year' },
    { name: 'Function Health Annual', price: 499, solPrice: 2.82, period: 'year' },
    { name: 'Whoop Life', price: 359, solPrice: 2.03, period: 'year' },
  ],
  'Lifestyle': [
    { name: 'Peloton App+Membership', price: 179, solPrice: 1.0, period: 'year' },
    { name: 'Apple One Premier Bundle', price: 455.40, solPrice: 2.57, period: 'year' },
    { name: 'Calm Premium', price: 69.99, solPrice: 0.40, period: 'year' },
    { name: 'MasterClass Annual', price: 180, solPrice: 1.02, period: 'year' },
    { name: 'FabFitFun Annual Bundle', price: 200, solPrice: 1.13, period: 'year' },
  ],
  'News': [
    { name: 'The New York Times Digital', price: 99, solPrice: 0.56, period: 'year' },
    { name: 'The Washington Post Digital', price: 95, solPrice: 0.54, period: 'year' },
    { name: 'Financial Times', price: 355, solPrice: 2.0, period: 'year' },
    { name: 'The Economist', price: 199, solPrice: 1.13, period: 'year' },
    { name: 'Bloomberg Digital', price: 179, solPrice: 1.01, period: 'year' },
  ],
  'Shopping': [
    { name: 'Amazon Prime', price: 139, solPrice: 0.79, period: 'year' },
    { name: 'Flipkart Plus', price: 6, solPrice: 0.034, period: 'year', region: 'India' },
    { name: 'Target Circle RedCard', price: 30, solPrice: 0.17, period: 'year', estimated: true },
    { name: 'Walmart+', price: 98, solPrice: 0.55, period: 'year' },
    { name: 'Costco Membership', price: 60, solPrice: 0.34, period: 'year' },
  ],
};

// --- Data for Categories (Modern Look) ---
const categories = [
  { name: 'Crypto Analytics', color: '#f59e0b', brands: [{}, {}] },
  { name: 'Productivity', color: '#6366f1', brands: [{}, {}, {}] },
  { name: 'OTT', color: '#4a5568', brands: [{}, {}, {}] },
  { name: 'Music', color: '#4299e1', brands: [{}, {}] },
  { name: 'Socials', color: '#e53e3e', brands: [{}] },
  { name: 'Food & Drinks', color: '#dd6b20', brands: [{}, {}] },
  { name: 'Health', color: '#38a169', brands: [{}, {}, {}] },
  { name: 'Lifestyle', color: '#d69e2e', brands: [{}] },
  { name: 'News', color: '#8b5cf6', brands: [{}] },
  { name: 'Shopping', color: '#ec4899', brands: [{}, {}] },
];

// --- Data for Promotional Carousel ---
const promoData = [
    {
        key: '1',
        text: 'Get 10% off on your first subscription',
        image: 'https://i.imgur.com/gTqgO3P.png',
        backgroundColor: '#27272a',
    },
    {
        key: '2',
        text: 'Explore Exclusive Gaming Bundles',
        image: null,
        backgroundColor: '#3f3f46',
    },
    {
        key: '3',
        text: 'Listen to Ad-free Music',
        image: null,
        backgroundColor: '#4299e1',
    },
    {
        key: '4',
        text: 'Productivity Apps for 50% Off',
        image: null,
        backgroundColor: '#38a169',
    },
];

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const SPACING = 16;
const SIDECARD_LENGTH = (screenWidth - CARD_WIDTH - SPACING) / 2;

// --- Subscription Modal Component ---
interface SubscriptionModalProps {
  visible: boolean;
  category: string | null;
  onClose: () => void;
}

const SubscriptionModal = ({ visible, category, onClose }: SubscriptionModalProps) => {
  const subscriptions = category ? subscriptionData[category] || [] : [];
  const { isProcessing, processPayment, paymentResult } = useSubscriptionPayment();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activatedSubscription, setActivatedSubscription] = useState<any>(null);

  // Debug logging
  console.log('SubscriptionModal - category:', category);
  console.log('SubscriptionModal - subscriptions:', subscriptions);
  console.log('SubscriptionModal - visible:', visible);
  console.log('SubscriptionModal - subscriptionData keys:', Object.keys(subscriptionData));
  console.log('SubscriptionModal - selected category data:', category ? subscriptionData[category] : 'No category');

  // Force re-render when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('Modal became visible with category:', category);
      console.log('Subscriptions for this category:', subscriptions);
    }
  }, [visible, category, subscriptions]);

  // Fallback test data if no subscriptions found
  const testSubscriptions = [
    { name: 'Test Subscription 1', price: 99.99, solPrice: 0.5, period: 'year' },
    { name: 'Test Subscription 2', price: 199.99, solPrice: 1.0, period: 'year' }
  ];

  const displaySubscriptions = subscriptions.length > 0 ? subscriptions : testSubscriptions;

  const handlePayment = async (subscription: Subscription) => {
    try {
      // Convert local subscription to service subscription format
      const subscriptionWithCategory: SubscriptionType = {
        id: '',
        name: subscription.name,
        price: subscription.price,
        solPrice: subscription.solPrice,
        period: subscription.period,
        estimated: subscription.estimated || false,
        region: subscription.region,
        category: category || 'Unknown'
      };

      const result = await processPayment(subscriptionWithCategory);
      
      if (result.success && 'subscription' in result && result.subscription) {
        setActivatedSubscription(result.subscription);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Payment Failed', result.error || 'Failed to process payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
      console.error('Payment error:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setActivatedSubscription(null);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalSafeArea}>
          <View style={styles.modalContentContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{category}</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {displaySubscriptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No subscriptions found for {category}</Text>
                </View>
              ) : (
                displaySubscriptions.map((subscription: Subscription, index: number) => (
                  <View key={index} style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                      <Text style={styles.subscriptionName}>{subscription.name}</Text>
                      {subscription.estimated && (
                        <View style={styles.estimatedTag}>
                          <Text style={styles.estimatedText}>Est.</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${subscription.price.toFixed(2)}</Text>
                      <Text style={styles.period}>/{subscription.period}</Text>
                    </View>
                    
                    <View style={styles.solPriceContainer}>
                      <Text style={styles.solPrice}>~{subscription.solPrice} SOL</Text>
                    </View>
                    
                    {subscription.region && (
                      <Text style={styles.regionText}>{subscription.region}</Text>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]}
                      onPress={() => handlePayment(subscription)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.paymentButtonText}>
                        {isProcessing ? 'Processing...' : 'Pay with SOL'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PaymentSuccessModal
        visible={showSuccessModal}
        subscription={activatedSubscription}
        onClose={handleSuccessModalClose}
      />
    </>
  );
};

const HomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // --- Auto-scroll logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        // Calculate the next index
        const nextIndex = activeIndex === promoData.length - 1 ? 0 : activeIndex + 1;
        
        flatListRef.current.scrollToIndex({
          animated: true,
          index: nextIndex,
        });
        setActiveIndex(nextIndex);
      }
    }, 3000); // Scrolls every 3 seconds

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleCategoryPress = (categoryName: string) => {
    console.log('Category pressed:', categoryName);
    console.log('Available categories:', Object.keys(subscriptionData));
    console.log('Subscriptions for category:', subscriptionData[categoryName]);
    setSelectedCategory(categoryName);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, 👋</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={{ color: '#FFFFFF', fontSize: 16, marginRight: 20 }}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* --- Main Scrollable Content --- */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* --- Auto-scrolling Promotional Carousel --- */}
          <View style={styles.promoCarouselContainer}>
            <FlatList
              ref={flatListRef}
              data={promoData}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.key}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: SIDECARD_LENGTH,
              }}
              renderItem={({ item }) => (
                <View style={[styles.promoCard, { backgroundColor: item.backgroundColor }]}>
                  <Text style={styles.promoText}>{item.text}</Text>
                  {item.image && (
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.promoImage}
                      resizeMode='contain'
                      onError={(e) => console.log(e.nativeEvent.error)}
                    />
                  )}
                </View>
              )}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: CARD_WIDTH + SPACING,
                offset: (CARD_WIDTH + SPACING) * index,
                index,
              })}
            />
            {/* --- Pagination Dots --- */}
            <View style={styles.pagination}>
              {promoData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index === activeIndex ? '#a3e635' : '#52525b' },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* --- Categories Section (Enhanced Modern Look) --- */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionSubtitle}>from 300+ brands</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.categoryCardModern, { backgroundColor: category.color }]}
                  onPress={() => handleCategoryPress(category.name)}
                >
                  <Text style={styles.categoryTitleModern}>{category.name}</Text>
                  <View style={styles.brandIconsContainer}>
                    {category.brands.slice(0, 3).map((_, brandIndex) => (
                      <View 
                        key={brandIndex}
                        style={[
                          styles.brandCircle,
                          { right: brandIndex * 18 },
                          { zIndex: category.brands.length - brandIndex }
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- Footer Tab Bar --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Text style={{ color: '#a3e635', fontSize: 20 }}>🏠</Text>
          <Text style={[styles.footerText, { color: '#a3e635' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => router.push('/tabs/sleek')}
        >
          <Text style={{ color: '#888888', fontSize: 20 }}>📋</Text>
          <Text style={styles.footerText}>Sleek</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => router.push('/tabs/rewards')}
        >
          <Text style={{ color: '#888888', fontSize: 20 }}>🎁</Text>
          <Text style={styles.footerText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => router.push('/tabs/account')}
        >
          <Text style={{ color: '#888888', fontSize: 20 }}>👤</Text>
          <Text style={styles.footerText}>Account</Text>
        </TouchableOpacity>
      </View>

      {/* --- Subscription Modal --- */}
      <SubscriptionModal
        visible={modalVisible}
        category={selectedCategory}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    paddingBottom: 20, // Add padding to the bottom to avoid content hiding behind footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#a3e635',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#121212',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoCarouselContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  promoCard: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: SPACING / 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    maxWidth: '60%',
  },
  promoImage: {
    width: 150,
    height: 100,
    position: 'absolute',
    right: -20,
    bottom: -10,
    transform: [{ rotate: '-10deg' }],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  categoriesSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCardModern: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryTitleModern: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandIconsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    height: 28,
  },
  brandCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalContentContainer: {
    flex: 1,
    paddingBottom: 20, // Add padding to the bottom to avoid content hiding behind footer
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  devnetIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  debugButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subscriptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  estimatedBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estimatedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a3e635',
  },
  periodText: {
    fontSize: 14,
    color: '#a0a0a0',
    marginLeft: 4,
  },
  solPriceContainer: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  solPriceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  regionText: {
    fontSize: 12,
    color: '#a0a0a0',
    fontStyle: 'italic',
  },
  paymentButton: {
    backgroundColor: '#a3e635',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  paymentButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButtonDisabled: {
    backgroundColor: '#52525b',
    opacity: 0.7,
  },
  debugInfoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  debugInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  debugInfoText: {
    fontSize: 12,
    color: '#a0a0a0',
    fontFamily: 'monospace',
  },
  addressCheckContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38a169',
  },
  addressCheckTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  checkAddressButton: {
    backgroundColor: '#38a169',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkAddressButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  estimatedTag: { // Added style for estimatedTag
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  price: { // Added style for price
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a3e635',
  },
  period: { // Added style for period
    fontSize: 14,
    color: '#a0a0a0',
    marginLeft: 4,
  },
  solPrice: { // Added style for solPrice
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyStateText: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
