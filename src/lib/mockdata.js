// ============================================================================
// MOCK DATA - Simulates data that would normally come from API/Redux
// ============================================================================

const MOCK_MEAL_PLANS = [
  {
    id: 'mp1',
    name: 'Basic Vegetarian Plan',
    price: 12.99,
    items: [
      { id: 'item1', name: 'Dal Tadka', quantity: 1 },
      { id: 'item2', name: 'Roti (4 pcs)', quantity: 1 },
      { id: 'item3', name: 'Rice', quantity: 1 },
    ],
    days: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 0 }, // Mon-Fri
  },
  {
    id: 'mp2',
    name: 'Premium Non-Veg Plan',
    price: 18.99,
    items: [
      { id: 'item4', name: 'Butter Chicken', quantity: 1 },
      { id: 'item5', name: 'Naan (3 pcs)', quantity: 1 },
      { id: 'item6', name: 'Jeera Rice', quantity: 1 },
      { id: 'item7', name: 'Salad', quantity: 1 },
    ],
    days: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 0 }, // Mon-Sat
  },
  {
    id: 'mp3',
    name: 'Keto Special',
    price: 22.99,
    items: [
      { id: 'item8', name: 'Grilled Chicken', quantity: 1 },
      { id: 'item9', name: 'Cauliflower Rice', quantity: 1 },
      { id: 'item10', name: 'Avocado Salad', quantity: 1 },
    ],
    days: { 0: 1, 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0 }, // Mon, Wed, Fri
  },
];

const MOCK_ROUTES = [
  { id: 'route1', name: 'Downtown Route', driver: { firstName: 'John' }, subscriberCount: 25 },
  { id: 'route2', name: 'Suburban East', driver: { firstName: 'Sarah' }, subscriberCount: 18 },
  { id: 'route3', name: 'Westside Loop', driver: { firstName: 'Mike' }, subscriberCount: 32 },
];

const MOCK_SETTINGS = {
  currency: '$',
  deliveryDays: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 0 },
};

// ============================================================================
// CONSTANTS
// ============================================================================

const DELIVERY_METHOD = {
  HOME_DELIVERY: 'homeDelivery',
  PICK_UP: 'pickUp',
};

const SUBSCRIPTION = {
  TYPE: {
    SCHEDULED: {
      LABEL: 'Scheduled',
      KEY: 'scheduled',
      OPTIONS: {
        WEEKLY: 'Weekly',
        BIWEEKLY: 'Bi-Weekly',
        MONTHLY: 'Monthly',
        CUSTOM: 'Custom',
        SINGLE: 'Single',
      },
      CUSTOM_OPTIONS: {
        BY_END_DATE: 'By End Date',
        BY_DELIVERIES: 'By Deliveries',
      },
    },
    ON_DEMAND: {
      LABEL: 'On Demand',
      KEY: 'onDemand',
      OPTIONS: {
        WITH_END_DATE: 'withEndDate',
        WITHOUT_END_DATE: 'withoutEndDate',
      },
    },
  },
};

const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partiallyPaid',
};

const PAYMENT_MODE = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  E_TRANSFER: 'E-Transfer',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


export {
MOCK_MEAL_PLANS,
PAYMENT_MODE,
PAYMENT_STATUS,
SUBSCRIPTION,
DELIVERY_METHOD,
MOCK_ROUTES,
MOCK_SETTINGS,
DAY_LABELS,
};