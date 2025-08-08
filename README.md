# Travio - Next.js Globe Explorer

A modern, interactive 3D globe webapp built with Next.js, TypeScript, and Mapbox GL JS. Features a continuously spinning globe with satellite imagery, search functionality, and a chatbot interface ready for future AI integration.

## 🌟 Features

### Current Features
- **3D Globe View**: Realistic satellite imagery with atmospheric effects
- **Auto-Spinning**: Continuous rotation with adjustable speed
- **Interactive Controls**: Pause/resume spinning, reset view, zoom controls
- **Modern UI**: Beautiful glassmorphism design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Country Boundaries**: Interactive country borders and labels
- **Smart Interaction**: Automatically pauses spinning when user interacts

### Future-Ready Features
- **🔍 Search Interface**: Location search with autocomplete (ready for API integration)
- **💬 Chat Interface**: Chatbot interface with image sharing capabilities
- **🗺️ Map Integration**: Zoom in/out controls and location navigation
- **📱 Mobile Optimized**: Touch-friendly controls and responsive layout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mapbox account and access token

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd travio-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```

4. **Get your Mapbox Access Token**
   - Go to [Mapbox Account](https://account.mapbox.com)
   - Sign up or sign in
   - Navigate to "Access Tokens"
   - Copy your default public token or create a new one

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
travio-nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and Mapbox customizations
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Main page with component integration
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── button.tsx       # Button component with variants
│   │   │   ├── input.tsx        # Input component
│   │   │   └── dialog.tsx       # Dialog/modal component
│   │   ├── Map.tsx              # Main map component with spinning globe
│   │   ├── Search.tsx           # Search interface component
│   │   └── Chat.tsx             # Chat interface component
│   └── lib/
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🎮 Usage

### Globe Controls
- **Auto-Spin**: The globe automatically rotates continuously
- **Pause/Resume**: Click the pause button to stop/start rotation
- **Reset View**: Click reset to return to the initial position
- **Zoom Controls**: Use the zoom buttons or scroll to zoom in/out
- **Manual Navigation**: Click and drag to explore different parts of the globe

### Search Feature
- Click the search bar at the top to open the search interface
- Type to search for countries, cities, or landmarks
- Click on results to select them (future: will fly to location)

### Chat Interface
- Click the chat button in the bottom-right corner
- Type messages and press Enter to send
- Upload images using the image button
- Currently shows placeholder responses (ready for AI integration)

## 🔧 Customization

### Changing Spin Speed
Modify the `secondsPerRevolution` variable in `src/components/Map.tsx`:
```typescript
const secondsPerRevolution = 240; // Lower = faster rotation
```

### Changing Map Style
Update the style URL in the Map component:
```typescript
style: 'mapbox://styles/mapbox/satellite-v9', // Current: Satellite
// Other options:
// 'mapbox://styles/mapbox/streets-v12' // Streets
// 'mapbox://styles/mapbox/outdoors-v12' // Outdoors
// 'mapbox://styles/mapbox/light-v11' // Light
// 'mapbox://styles/mapbox/dark-v11' // Dark
```

### Styling
The app uses Tailwind CSS with custom CSS variables. Modify `src/app/globals.css` for global style changes.

## 🔮 Future Enhancements

### Planned Features
- **AI Chatbot Integration**: Connect to OpenAI, Claude, or other AI services
- **Real Search API**: Integrate with Mapbox Geocoding API or Google Places
- **Location Bookmarks**: Save and manage favorite locations
- **Weather Integration**: Display weather data for selected locations
- **Travel Planning**: Create and share travel itineraries
- **Social Features**: Share locations and experiences
- **Offline Support**: Cache map tiles for offline viewing

### API Integrations Ready
- **Mapbox APIs**: Geocoding, Directions, Geocoding
- **OpenAI API**: For chatbot functionality
- **Weather APIs**: For location-based weather data
- **Image APIs**: For location photos and galleries

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Adding New Features
1. Create new components in `src/components/`
2. Add UI components to `src/components/ui/` if reusable
3. Update the main page to include new components
4. Add any new dependencies to `package.json`

### Environment Variables
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Required for map functionality
- Future: Add API keys for chatbot, search, and other services

## 🎨 Design System

The app uses a modern design system with:
- **Glassmorphism**: Translucent, blurred backgrounds
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Grid**: Tailwind CSS responsive utilities
- **Icon System**: Lucide React icons
- **Color Scheme**: CSS custom properties for easy theming

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Maps powered by [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Support

For questions or issues:
1. Check the [Mapbox GL JS documentation](https://docs.mapbox.com/mapbox-gl-js/)
2. Ensure your access token is valid and has the necessary permissions
3. Verify you're running the app on a local server
4. Open an issue in the repository

---

**Happy exploring! 🌍✨**
