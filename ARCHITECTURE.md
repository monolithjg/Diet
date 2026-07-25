# Diet & Macronutrient Calculator Architecture

This document outlines the mobile-first architecture and performance optimization strategies for the Diet & Macronutrient Calculator project.

## Application Composition

`src/main.tsx` is the browser entry point and `src/routes.tsx` is the single
composition root for the React application. Route-level features are loaded
lazily beneath `src/components/layout/Layout.tsx`, which owns the shared page
shell and renders route content through React Router's `Outlet`.

Keep these boundaries explicit:

- `main.tsx` owns browser bootstrapping, service-worker setup, and telemetry.
- `routes.tsx` owns route declarations and route-level code splitting.
- `components/layout/Layout.tsx` owns shared navigation and page chrome.
- `features/*` own feature orchestration and may depend on shared UI, hooks,
  models, constants, and domain logic.
- `lib/*` and `models/*` must remain independent of React components.

Do not introduce a second router or app shell. New pages should be exported
from their feature and registered directly in `routes.tsx`.

## Tech Stack

### Core Technologies
- **React 19** with TypeScript for UI components and mobile-first design
- **Vite** for fast development, optimized builds, and code splitting
- **TailwindCSS** for utility-first, mobile-first responsive styling
- **Zustand** for lightweight state management with performance optimization
- **React Router v7** for routing with lazy loading
- **Recharts** for responsive data visualization
- **Radix UI/shadcn** for accessible, mobile-optimized UI components
- **Vitest + React Testing Library** for comprehensive testing (266 tests)

### Mobile Optimization Technologies
- **React.lazy()** for code splitting and on-demand loading
- **Network Information API** for connection-aware optimization
- **Intersection Observer API** for progressive loading
- **CSS `touch-manipulation`** for improved mobile performance

## Mobile-First Architecture Principles

### 1. **Progressive Enhancement**
- Base functionality works on all devices
- Enhanced features for better connections/hardware
- Graceful degradation for slow networks

### 2. **Touch-First Design**
- All interactive elements ≥44px touch targets
- Touch-friendly spacing and gestures
- Mobile keyboard optimization (`inputMode`, `type`)

### 3. **Performance-First Loading**
- Critical path optimization (13.72KB main bundle)
- Lazy loading of non-essential features
- Connection-aware resource loading

## Folder Structure

The project follows a **feature-first organization** with **atomic design principles** and **mobile optimization**:

```
src/
├── features/                    # Feature modules
│   ├── wizard/                  # Mobile-optimized calculator wizard
│   │   ├── atoms/               # Mobile-first UI primitives
│   │   │   ├── MobileValidationFeedback.tsx   # Mobile validation UI
│   │   │   ├── MobileStepCompletion.tsx       # Mobile progress tracking
│   │   │   ├── MobileHelpGuidance.tsx         # Contextual mobile help
│   │   │   ├── LazyMobileHelpGuidance.tsx     # Lazy-loaded help
│   │   │   ├── LazyAdvancedSettings.tsx       # Lazy-loaded advanced features
│   │   │   ├── ProgressiveLoader.tsx          # Loading states with skeletons
│   │   │   ├── ChunkErrorBoundary.tsx         # Error handling for lazy chunks
│   │   │   └── StepLoadingFallback.tsx        # Step-specific loading
│   │   ├── molecules/           # Composed mobile components
│   │   │   ├── Step1PersonalInfo.tsx          # Mobile-optimized personal info
│   │   │   ├── Step2BodyComposition.tsx       # Progressive disclosure
│   │   │   ├── Step3ActivityGoals.tsx         # Mobile-first activity selection
│   │   │   └── Step4DietPreferences.tsx       # Touch-optimized diet selection
│   │   ├── organisms/           # Complex mobile layouts
│   │   │   ├── MobileWizardLayout.tsx         # Responsive wizard container
│   │   │   └── MobileProgressBar.tsx          # Mobile progress indicator
│   │   └── index.tsx            # Main wizard with lazy loading
│   └── results/                 # Results display with mobile optimization
├── lib/                         # Core business logic
│   ├── cge/                     # Contextual Guidance Engine
│   │   ├── i18n.ts             # Internationalization system
│   │   └── rules/              # Guidance rule sets
│   ├── store.ts                 # Zustand composition and public hook
│   ├── store/                   # Store domain modules
│   │   ├── calculations.ts      # Pure nutrition calculations
│   │   ├── guidance.ts          # CGE projection and scheduling
│   │   ├── persistence.ts       # Local storage boundary
│   │   ├── state.ts             # Initial state factories
│   │   └── types.ts             # Store state and action contracts
│   ├── rmr.ts                   # RMR calculations
│   ├── tdee.ts                  # TDEE calculations
│   └── macros.ts                # Macro distribution
├── hooks/                       # Performance-optimized hooks
│   ├── useConnectionAware.ts    # Network-aware optimization
│   ├── useDebouncedStore.ts     # Mobile input performance
│   └── useUnitConversion.ts     # Mobile-friendly unit conversion
├── components/                  # Shared mobile-optimized components
│   └── ui/                      # Touch-optimized UI primitives
│       ├── Button.tsx           # 44px+ touch targets
│       ├── Slider.tsx           # Mobile-friendly sliders
│       ├── ToggleGroup.tsx      # Touch-optimized selection
│       └── ...
├── models/                      # Data models and interfaces
├── constants/                   # Configuration and presets
├── routes.tsx                  # Route composition and lazy page loading
└── main.tsx                    # Browser bootstrap and runtime services
```

## State Management & Performance

### Zustand Store Architecture
We use a **single optimized Zustand store** with three logical slices and performance enhancements:

```typescript
interface Store {
  user: UserInput;              // Raw inputs (localStorage persisted)
  calc: {                       // Calculated values (memory only)
    derivedMetrics: DerivedMetrics;
    macroPlan: MacroPlan;
  };
  ui: {                         // UI state (sessionStorage persisted)
    step: number;
    unit: 'metric' | 'imperial';
    guidance: GuidanceItem[];
  };
}
```

The public `useStore` hook remains in `lib/store.ts`, but domain work is kept
outside the Zustand initializer. Calculation and guidance modules expose pure
functions, persistence is isolated behind a storage adapter, and fresh-state
factories prevent reset operations from sharing mutable defaults.

### Performance Optimizations
- **Debounced Updates**: `useDebouncedStore` for mobile input performance
- **Selective Persistence**: Only essential data persisted
- **Memoized Selectors**: Prevent unnecessary re-renders
- **Batched Updates**: Reduce store update frequency

## Mobile-First Code Splitting Strategy

### Bundle Optimization
| Bundle | Size | Gzipped | Load Strategy |
|--------|------|---------|---------------|
| **Main Bundle** | 53.51KB | **13.72KB** | Critical path - immediate |
| Step3ActivityGoals | 11.10KB | 3.67KB | Lazy - user progress |
| Step4DietPreferences | 9.54KB | 3.27KB | Lazy - user progress |
| MobileHelpGuidance | 5.89KB | 2.48KB | Lazy - user intent |
| BodyFatSlider | 3.94KB | 1.51KB | Lazy - progressive disclosure |
| ManualRmrInput | 3.59KB | 1.56KB | Lazy - advanced features |

### Lazy Loading Implementation
```typescript
// Intelligent lazy loading with error boundaries
const Step3ActivityGoals = React.lazy(() => import('./molecules/Step3ActivityGoals'));

// Usage with mobile-optimized fallbacks
<ChunkErrorBoundary stepName="Activity & Goals">
  <Suspense fallback={<StepLoadingFallback stepName="Activity & Goals" />}>
    <Step3ActivityGoals />
  </Suspense>
</ChunkErrorBoundary>
```

### Connection-Aware Loading
```typescript
// Adaptive loading based on network conditions
const { isSlowConnection, connectionType } = useConnectionAware();
const { preloadNextStep } = useChunkPreloader();

// Smart preloading strategies
useEffect(() => {
  if (step === 1 && connectionType === 'wifi') {
    preloadNextStep(step);  // Preload on good connections
  }
}, [step, connectionType]);
```

## Mobile User Experience Patterns

### 1. **Progressive Disclosure**
- Advanced settings collapsed by default on mobile
- "Show more" patterns for optional fields
- Contextual help available but not overwhelming

### 2. **Touch Optimization**
- **Minimum 44px touch targets** for all interactive elements
- **8px spacing** between adjacent touch targets
- **`touch-manipulation`** CSS for improved mobile performance
- Visual feedback for all touch interactions

### 3. **Responsive Layout Patterns**
```typescript
// Mobile-first grid patterns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"

// Progressive button ordering
className="flex flex-col sm:flex-row gap-3
  <Button className="w-full sm:w-auto order-2 sm:order-1">Back</Button>
  <Button className="w-full sm:w-auto order-1 sm:order-2">Continue</Button>
```

### 4. **Mobile Input Optimization**
```typescript
// Optimized input attributes for mobile
<Input
  type="number"
  inputMode="numeric"     // Mobile numeric keyboard
  pattern="[0-9]*"        // iOS numeric keyboard
  className="min-h-[44px]" // Touch-friendly height
/>
```

## Network & Performance Optimization

### Connection-Aware Features
- **Automatic network detection** (WiFi, cellular, slow connections)
- **Adaptive loading strategies** based on connection quality
- **Save data mode support** for reduced data usage
- **Progressive enhancement** for different network conditions

### Loading State Management
```typescript
// Progressive loading with skeleton screens
<ProgressiveLoader
  isLoading={isLoading}
  skeletonVariant="step"
  minLoadingTime={300}    // Prevent loading flash
>
  <StepContent />
</ProgressiveLoader>
```

### Performance Monitoring
- **Bundle size tracking** with build-time analysis
- **Re-render optimization** through React.memo and useMemo
- **Touch performance** with requestAnimationFrame optimization
- **Memory management** with proper cleanup in useEffect

## Accessibility & Internationalization

### Mobile Accessibility
- **WCAG 2.1 AA compliance** including mobile screen readers
- **Touch target accessibility** (≥44px with proper spacing)
- **Keyboard navigation** optimized for mobile devices
- **Focus management** for modal and step navigation

### Internationalization
- **English/Spanish** full localization support
- **Context-aware translations** with token replacement
- **Automatic locale detection** with manual override
- **Mobile-optimized text rendering** for different languages

## Error Handling & Resilience

### Mobile-Specific Error Handling
```typescript
// Robust error boundaries for mobile
<ChunkErrorBoundary fallback={<MobileErrorFallback />}>
  <LazyComponent />
</ChunkErrorBoundary>
```

### Network Resilience
- **Retry mechanisms** for failed chunk loads
- **Offline detection** and graceful degradation
- **Timeout handling** for slow connections
- **Cache strategies** for improved performance

## Testing Strategy

### Mobile Testing Coverage
- **266 comprehensive tests** including mobile-specific scenarios
- **Touch interaction testing** with React Testing Library
- **Responsive behavior validation** across breakpoints
- **Performance regression testing** for bundle sizes
- **Accessibility testing** for mobile screen readers

### Test Categories
- **Unit Tests**: Core calculation logic
- **Integration Tests**: Complete mobile user flows
- **Performance Tests**: Bundle size and loading optimization
- **Accessibility Tests**: Mobile compliance validation

## Build & Deployment Optimization

### Production Build Optimization
```bash
# Optimized production build
npm run build  # 2.52s build time with full optimization
```

### Vite Configuration
- **Tree shaking** for minimal bundle sizes
- **Dynamic imports** with proper chunk naming
- **CSS optimization** with PurgeCSS integration
- **Asset optimization** for mobile delivery

## Data Flow & Mobile UX

### Typical Mobile User Journey
1. **Initial Load**: Critical 13.72KB bundle loads immediately
2. **Step Navigation**: Lazy chunks load based on user progress
3. **Form Interaction**: Debounced updates prevent UI blocking
4. **Validation**: Real-time mobile-friendly feedback
5. **Results**: Comprehensive calculations with shareable URLs

### Mobile-Optimized Data Flow
- **Input debouncing** prevents excessive store updates
- **Progressive calculation** as user advances through steps
- **Connection-aware preloading** for smooth transitions
- **Optimistic UI updates** for immediate feedback

## Future Mobile Enhancements

### Planned Improvements
- **Service Worker** for offline functionality
- **Push notifications** for calculation reminders
- **PWA features** for app-like mobile experience
- **Advanced gestures** (swipe navigation, pinch-to-zoom)
- **Haptic feedback** for supported mobile devices

This architecture ensures exceptional mobile performance while maintaining scalability, accessibility, and developer experience.
