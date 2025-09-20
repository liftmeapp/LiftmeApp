import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Mock API base URL - replace with your actual API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com';

// Color scheme
const colors = {
  primary: '#2563eb',
  secondary: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#1e293b',
  gray: '#64748b',
  white: '#ffffff',
  border: '#e2e8f0',
  background: '#f1f5f9'
};

// Types
interface PendingBusiness {
  id: string;
  name: string;
  type: 'GARAGE' | 'TOW_TRUCK';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  owner: {
    firstName: string;
    lastName: string | null;
    email: string;
    phone?: string;
  };
  ownerId: string;
  address?: string;
  description?: string;
  services?: any[];
  documents?: any[];
  createdAt: string;
  rejectionReason?: string;
  // Garage specific
  phoneNumber?: string;
  operatingHours?: any;
  // Tow truck specific
  driverName?: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  licenseNumber?: string;
}

interface Business {
  id: string; name: string; type: 'GARAGE' | 'TOW_TRUCK'; status: 'PENDING' | 'APPROVED' | 'REJECTED';
  owner: { firstName: string; lastName: string | null; email: string; phone?: string; };
  ownerId: string; createdAt: string; address?: string; services?: any[];
  // Other optional fields
}

interface StatsData {
  pendingGarages: number;
  pendingTowTrucks: number;
  totalUsers: number;
  totalBusinesses: number;
  approvedToday: number;
  rejectedToday: number;
}

interface BusinessDetailModalProps {
  business: PendingBusiness | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (id: string, type: 'GARAGE' | 'TOW_TRUCK') => void;
  onReject: (id: string, type: 'GARAGE' | 'TOW_TRUCK', reason: string) => void;
  onBan: (userId: string, userName: string) => void; // Added onBan handler
}

// Reusable Components
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      {/* Text container */}
      <View style={styles.statCardTextContainer}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={[styles.statCardValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </View>
      {/* Icon container */}
      <View style={[styles.statCardIconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
      </View>
    </View>
  );
};

  type BusinessCardProps = Business | PendingBusiness;

  const BusinessCard = ({ business, onViewDetails }: {
    business: BusinessCardProps;
    onViewDetails: (business: BusinessCardProps) => void;
  }) => (
    <TouchableOpacity onPress={() => onViewDetails(business)} style={styles.businessCard}>
      <View style={styles.businessCardHeader}>
        <View style={styles.businessCardInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessType}>{business.type === 'GARAGE' ? '🏢 Garage' : '🚛 Tow Truck'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(business.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(business.status) }]}>{business.status}</Text>
        </View>
      </View>
      <View style={styles.businessDetails}>
        <View style={styles.detailRow}><Ionicons name="person-circle-outline" size={16} color={colors.gray} /><Text style={styles.detailText}>{business.owner.firstName} {business.owner.lastName || ''}</Text></View>
        <View style={styles.detailRow}><Ionicons name="mail-outline" size={16} color={colors.gray} /><Text style={styles.detailText}>{business.owner.email}</Text></View>
        {business.address && <View style={styles.detailRow}><Ionicons name="location-outline" size={16} color={colors.gray} /><Text style={styles.detailText} numberOfLines={1}>{business.address}</Text></View>}
        <View style={styles.detailRow}><Ionicons name="time-outline" size={16} color={colors.gray} /><Text style={styles.detailText}>{new Date(business.createdAt).toLocaleDateString()}</Text></View>
      </View>
      <View style={styles.businessActions}>
          <Text style={styles.viewDetailsText}>View Details & Actions</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );


const BusinessDetailModal = ({ business, visible, onClose, onApprove, onReject, onBan }: BusinessDetailModalProps) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    useEffect(() => {
        if (!visible) {
            setShowRejectForm(false);
            setRejectReason('');
        }
    }, [visible]);

    if (!business) return null;

    const handleApprove = () => onApprove(business.id, business.type);
    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for rejection.');
            return;
        }
        onReject(business.id, business.type, rejectReason);
        onClose();
    };
    // Use the ownerId from the business object for the ban action
    const handleBan = () => onBan(business.ownerId, `${business.owner.firstName} ${business.owner.lastName || ''}`);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{business.name}</Text>
                        <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={28} color={colors.gray} /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        {/* Status specific section */}
                        {business.status === 'REJECTED' && (
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitleRed}>Rejection Details</Text>
                                <DetailRow label="Reason" value={formatDisplayValue(business.rejectionReason)} />
                            </View>
                        )}
                        
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <DetailRow label="Business Name" value={formatDisplayValue(business.name)} />
                            <DetailRow label="Type" value={business.type === 'GARAGE' ? 'Garage' : 'Tow Truck'} />
                            <DetailRow label="Address" value={formatDisplayValue(business.address)} />
                            <DetailRow label="Submitted On" value={new Date(business.createdAt).toLocaleString()} />
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Owner Details</Text>
                            <DetailRow label="Owner Name" value={`${business.owner.firstName} ${business.owner.lastName || ''}`} />
                            <DetailRow label="Email" value={formatDisplayValue(business.owner.email)} />
                            <DetailRow label="Phone" value={formatDisplayValue(business.owner.phone)} />
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Business Specifics</Text>
                            {business.type === 'GARAGE' ? (
                                <>
                                    <DetailRow label="Contact Phone" value={formatDisplayValue(business.phoneNumber)} />
                                    {/* CRASH FIX: Apply formatter to operatingHours */}
                                    <DetailRow label="Operating Hours" value={formatDisplayValue(business.operatingHours)} />
                                </>
                            ) : (
                                <>
                                    <DetailRow label="Driver Name" value={formatDisplayValue(business.driverName)} />
                                    <DetailRow label="Vehicle" value={`${formatDisplayValue(business.make)} ${formatDisplayValue(business.model)} (${formatDisplayValue(business.year)})`} />
                                    <DetailRow label="Plate Number" value={formatDisplayValue(business.plateNumber)} />
                                    <DetailRow label="License Number" value={formatDisplayValue(business.licenseNumber)} />
                                </>
                            )}
                        </View>

                        {showRejectForm && (
                            <View style={styles.rejectForm}>
                                <Text style={styles.rejectFormTitle}>Reason for Rejection</Text>
                                <TextInput style={styles.rejectInput} placeholder="Enter reason..." value={rejectReason} onChangeText={setRejectReason} multiline />
                            </View>
                        )}
                    </ScrollView>

                    {/* --- DYNAMIC ACTION BUTTONS --- */}
                    <View style={styles.modalActions}>
                        {showRejectForm ? (
                            <>
                                <TouchableOpacity style={[styles.modalActionButton, styles.cancelButton]} onPress={() => setShowRejectForm(false)}><Text style={styles.modalActionText}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.modalActionButton, styles.confirmRejectButton]} onPress={handleConfirmReject}><Text style={styles.modalActionText}>Confirm Reject</Text></TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* PENDING status shows Approve and Reject buttons */}
                                {business.status === 'PENDING' && (
                                    <>
                                        <TouchableOpacity style={[styles.modalActionButton, styles.rejectButton]} onPress={() => setShowRejectForm(true)}><Text style={styles.modalActionText}>Reject</Text></TouchableOpacity>
                                        <TouchableOpacity style={[styles.modalActionButton, styles.approveButton]} onPress={handleApprove}><Text style={styles.modalActionText}>Approve</Text></TouchableOpacity>
                                    </>
                                )}

                                {/* PENDING and APPROVED statuses show the Ban button */}
                                {(business.status === 'PENDING' || business.status === 'APPROVED') && (
                                    <TouchableOpacity 
                                        style={[styles.banButton, business.status === 'APPROVED' && { flex: 1 }]} // Full width if it's the only button
                                        onPress={handleBan}
                                    >
                                        <Ionicons name="shield-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
                                        <Text style={styles.modalActionText}>Ban User</Text>
                                    </TouchableOpacity>
                                )}
                                
                                {/* If status is REJECTED, this space will be empty, which is intended. */}
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRowModal}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Helper functions
const formatDisplayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  if (typeof value === 'object') {
    // If it's an object, stringify it to prevent crashing.
    // This is a safe fallback.
    return JSON.stringify(value);
  }
  return String(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return colors.warning;
    case 'APPROVED': return colors.success;
    case 'REJECTED': return colors.danger;
    default: return colors.gray;
  }
};

// Main Component
export default function AdminVerificationDashboard() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const [allBusinesses, setAllBusinesses] = useState<PendingBusiness[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBanUser = (userId: string, userName: string) => {
    Alert.alert(
        'Confirm Ban',
        `Are you sure you want to permanently ban ${userName}? Their businesses will be disabled. This action is irreversible.`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Ban User',
                style: 'destructive',
                onPress: () => {
                    Alert.prompt('Reason for Ban', 'Please provide a brief reason.', async (reason) => {
                        if (reason) {
                            try {
                                const token = await getToken();
                                const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/ban`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reason }),
                                });
                                const responseData = await response.json();
                                if (!response.ok) { throw new Error(responseData.error || 'Failed to ban user.'); }
                                Alert.alert('Success', `${userName} has been banned.`);
                                setModalVisible(false);
                                fetchData();
                            } catch (error: any) { Alert.alert('Error', error.message); }
                        }
                    });
                }
            }
        ]
    );
  };

  const fetchData = useCallback(async () => {
    // We will control the loading state outside of this function
    try {
        const token = await getToken();
        if (!token) throw new Error("Authentication token not found.");

        const [statsResponse, businessesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/api/admin/all-businesses`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!statsResponse.ok || !businessesResponse.ok) {
            throw new Error('Failed to fetch data from the server.');
        }
        const statsData = await statsResponse.json();
        const businessesData = await businessesResponse.json();
        setStats(statsData);
        setAllBusinesses(businessesData);
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load dashboard data.');
    }
}, []);


  useEffect(() => {
  setLoading(true);
  fetchData().finally(() => setLoading(false));
}, [fetchData]);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchData().finally(() => setRefreshing(false));
}, [fetchData]);

  // --- LIVE ACTION HANDLERS ---
const handleApprove = async (businessId: string, type: 'GARAGE' | 'TOW_TRUCK') => {
    const apiType = type === 'GARAGE' ? 'garage' : 'tow-truck';
    Alert.alert('Confirm Approval', 'Are you sure you want to approve this business?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/applications/${apiType}/${businessId}/approve`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to approve business');
            Alert.alert('Success', 'Business approved successfully');
            setModalVisible(false);
            fetchData();
          } catch (error: any) { Alert.alert('Error', error.message); }
        }
      }
    ]);
};

const handleReject = async (businessId: string, type: 'GARAGE' | 'TOW_TRUCK', reason: string) => {
  const apiType = type === 'GARAGE' ? 'garage' : 'tow-truck';
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/applications/${apiType}/${businessId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject business');
    Alert.alert('Success', 'Business rejected successfully');
    setModalVisible(false);
    fetchData();
  } catch (error: any) { Alert.alert('Error', error.message); }
};

const filteredBusinesses = allBusinesses.filter(business => {
  const businessStatus = business.status || 'PENDING'; // Default to pending if status is missing
  const matchesTab = businessStatus.toLowerCase() === activeTab;
  const matchesSearch = (business.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                       `${business.owner.firstName} ${business.owner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
  return matchesTab && matchesSearch;
});

const renderContent = () => {
  if (loading && !refreshing) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading businesses...</Text>
          </View>
      );
  }
  if (filteredBusinesses.length === 0) {
      return (
          <ScrollView 
              contentContainerStyle={styles.emptyContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]}/>}
          >
              <Ionicons name="business-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No {activeTab} businesses</Text>
              <Text style={styles.emptySubtitle}>
                  {activeTab === 'pending'
                      ? 'All caught up! No pending applications to review.'
                      : `No ${activeTab} businesses found.`}
              </Text>
          </ScrollView>
      );
  }
  return (
      <FlatList
          data={filteredBusinesses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
              <BusinessCard
                  business={item}
                  onViewDetails={(business) => {
                      setSelectedBusiness(business as PendingBusiness);
                      setModalVisible(true);
                  }}
              />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]}/>}
      />
  );
};

return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verification Dashboard</Text>
        <Text style={styles.headerSubtitle}>Business Verification</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainerWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollViewContent}>
        <StatCard
          title="Pending Garages"
          value={stats?.pendingGarages ?? '...'}
          icon="car-outline"
          color={colors.warning}
        />
        <StatCard
          title="Pending Tow Trucks"
          value={stats?.pendingTowTrucks ?? '...'}
          icon="car-sport-outline"
          color={colors.info}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? '...'}
          icon="people-outline"
          color={colors.primary}
        />
        <StatCard
          title="Total Businesses"
          value={stats?.totalBusinesses ?? '...'}
          icon="business-outline"
          color={colors.success}
        />
        <StatCard
          title="Approved Today"
          value={stats?.approvedToday ?? '...'}
          icon="checkmark-circle-outline"
          color={colors.success}
        />
        <StatCard
          title="Rejected Today"
          value={stats?.rejectedToday ?? '...'}
          icon="close-circle-outline"
          color={colors.danger}
        />
      </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.gray} />
        <TextInput style={styles.searchInput} placeholder="Search by name or owner..." value={searchQuery} onChangeText={setSearchQuery}/>
      </View>

      <View style={styles.tabContainer}>
        {['pending', 'approved', 'rejected'].map((tabName) => (
            <TouchableOpacity
                key={tabName}
                style={[styles.tab, activeTab === tabName && styles.activeTab]}
                onPress={() => setActiveTab(tabName as any)}
            >
                <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
                    {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                </Text>
                <View style={[styles.tabBadge, { backgroundColor: getStatusColor(tabName.toUpperCase()) }]}>
                    <Text style={styles.tabBadgeText}>
                        {allBusinesses.filter(b => (b.status?.toLowerCase() || 'pending') === tabName).length}
                    </Text>
                </View>
            </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      <BusinessDetailModal
          business={selectedBusiness}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onBan={handleBanUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius:10
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily:'Poppins_600SemiBold',
    color: colors.dark,
  },
  viewDetailsText: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4
},
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 2,
  },
  statsContainerWrapper: {
    height: 160, // Adjusted height for better fit
    marginBottom: 10,
  },
  statsScrollViewContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
},
statCard: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: colors.white,
  borderRadius: 8,
  padding: 16,
  marginRight: 12,
  width: 180,
  height: '100%',
  borderLeftWidth: 4,
  elevation: 2,
  shadowColor: colors.dark,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},
statCardTextContainer: {
  flex: 1, // Allows the text to take up available space
},
statCardTitle: {
  fontSize: 12,
  fontFamily:'Poppins_400Regular',
  color: colors.gray,
  fontWeight: '500',
  marginBottom: 4,
},
statCardValue: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 2,
},
statCardSubtitle: {
  fontSize: 10,
  color: colors.gray,
},
statCardIconContainer: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 8, // Creates space between text and icon
},
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop:5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 1,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.dark,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 4,
    elevation: 1,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  activeTabText: {
    color: colors.white,
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  businessCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  businessCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessCardInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  businessDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 8,
    flex: 1,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  // --- MODAL STYLES ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%', // Make the modal taller
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.dark,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  detailRowModal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    width: 120, // Give a fixed width for alignment
  },
  detailValue: {
    fontSize: 14,
    color: colors.dark,
    flex: 1,
  },
  rejectForm: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  rejectFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 12,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.dark,
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: colors.light,
  },
  sectionTitleRed: { fontSize: 16, fontWeight: 'bold', color: colors.danger, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14, // Increased padding
    borderRadius: 10, // More rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    flexDirection: 'row',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.danger,
  },
  banButton: {
    backgroundColor: colors.danger,
    flex: 1.5, // Make it the most prominent button when approve/reject are hidden
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius:10,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: colors.gray,
  },
  confirmRejectButton: {
    backgroundColor: colors.danger,
  },
});