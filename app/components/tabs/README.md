# Future Tab Components

This directory contains tab components that are ready for future use but are not currently active in the tab bar.

## 📱 Available Components

### 1. **Plans Tab** (`plans.tsx`)
A comprehensive wellness planning system that allows users to:
- Create personalized wellness plans
- Track plan progress
- Manage different categories (mindfulness, sleep, stress, wellness)
- Set difficulty levels and durations
- Start/pause plans

**Features:**
- Plan creation modal with form validation
- Progress tracking with visual indicators
- Category-based organization
- Difficulty and duration selection
- Active/inactive plan states

### 2. **Review Tab** (`review.tsx`)
A user review system for wellness content that includes:
- Write and manage personal reviews
- Rate content with 5-star system
- Categorize reviews by wellness type
- Public/private review visibility
- Review statistics and analytics

**Features:**
- Review creation with rich text input
- Star rating system
- Category selection
- Privacy controls
- Review management (edit, delete, visibility toggle)
- Statistics dashboard

## 🚀 How to Activate These Tabs

### Option 1: Add to Tab Layout (Recommended)
Update `app/(tabs)/_layout.tsx` to include these tabs:

```typescript
<Tabs.Screen
  name="plans"
  options={{
    title: "Plans",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? "calendar" : "calendar-outline"}
        size={24}
        color={color}
      />
    ),
  }}
/>

<Tabs.Screen
  name="review"
  options={{
    title: "Review",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? "star" : "star-outline"}
        size={24}
        color={color}
      />
    ),
  }}
/>
```

### Option 2: Move Files to (tabs) Directory
Simply move the files from `app/components/tabs/` to `app/(tabs)/`:
```bash
mv app/components/tabs/plans.tsx app/\(tabs\)/
mv app/components/tabs/review.tsx app/\(tabs\)/
```

## 🔧 Customization

Both components are fully customizable:

- **Styling**: Update colors, fonts, and layout in the style objects
- **Data**: Replace mock data with real API calls
- **Features**: Add new functionality like sharing, notifications, etc.
- **Categories**: Modify the available categories and their icons

## 📊 API Integration

When ready to connect to the backend:

1. **Plans API**: Create endpoints for plan CRUD operations
2. **Reviews API**: Create endpoints for review management
3. **Update API Service**: Add methods in `app/services/api.ts`
4. **Replace Mock Data**: Update the `loadPlans()` and `loadReviews()` functions

## 🎨 Design System

Components use the existing design system:
- **Colors**: Teal (#0d9488), Gray variants, Semantic colors
- **Typography**: Consistent font sizes and weights
- **Spacing**: 8px grid system (8, 16, 24, 32)
- **Icons**: Ionicons from @expo/vector-icons
- **Components**: AuthGuard, existing UI patterns

## 📝 Notes

- Both components are fully functional with mock data
- They include proper TypeScript interfaces
- Authentication is handled via AuthGuard
- Responsive design for different screen sizes
- Error handling and user feedback included

## 🔮 Future Enhancements

Potential improvements:
- **Plans**: Integration with calendar, reminders, social sharing
- **Reviews**: Community features, moderation, content recommendations
- **Analytics**: Advanced progress tracking and insights
- **Gamification**: Badges, achievements, leaderboards
