# Image Generation Guide for "Why Choose Us" Section

## Image Dimensions

### Recommended Dimensions
**All Images: 1200px × 800px (3:2 aspect ratio)**

This dimension works perfectly for:
- **Mobile**: Cards are ~317px wide, images display at 300px × 124px (cropped)
- **Desktop**: Images take 30% of card width, full height (responsive)
- **High Quality**: 1200×800px ensures crisp display on retina screens

### Alternative Dimensions (if needed)
- **Minimum**: 800px × 600px (4:3 ratio) - Still good quality
- **Optimal**: 1200px × 800px (3:2 ratio) - **RECOMMENDED**
- **Maximum**: 1600px × 1067px (3:2 ratio) - For future-proofing

---

## Image File Names & Paths

Save images in: `/public/assets/images/`

1. **Safety First**: `safety-first.webp`
2. **Punctual**: `punctual.webp`
3. **Sustainable**: `sustainable.webp`
4. **Comfort**: `comfort.webp`

---

## Gemini Image Generation Prompts

### 1. Safety First Image
**File**: `safety-first.webp`  
**Dimensions**: 1200px × 800px  
**Color Theme**: Blue tones

**Prompt:**
```
Create a hyper-realistic, professional photograph of a modern taxi cab service emphasizing safety. The image should show:

- A clean, well-maintained white or blue sedan taxi cab in the foreground
- A professional, uniformed driver standing beside the vehicle, holding a clipboard and wearing a safety vest
- The driver should appear trustworthy and professional, with a warm smile
- In the background, show a GPS tracking device visible on the dashboard
- A first aid kit should be visible through the car window
- The scene should be set during daytime with natural, bright lighting
- Include subtle safety elements: a shield icon visible somewhere, emergency contact numbers displayed
- The overall mood should be professional, safe, and trustworthy
- Use a blue color scheme (shades of blue #095FF0, #00A5EC) as accent colors
- High resolution, photorealistic style, commercial photography quality
- Background should be a clean, modern urban setting (Kolkata/West Bengal context)
- The image should convey security, professionalism, and peace of mind
```

---

### 2. Punctual Image
**File**: `punctual.webp`  
**Dimensions**: 1200px × 800px  
**Color Theme**: Green tones

**Prompt:**
```
Create a hyper-realistic, professional photograph emphasizing punctuality and reliability in taxi service. The image should show:

- A modern taxi cab with a clock or time display prominently visible
- The vehicle should appear well-maintained and ready for service
- Show a driver checking time on a smartwatch or phone, emphasizing timeliness
- Include a GPS navigation screen showing real-time tracking
- The scene should convey efficiency and reliability
- Set during daytime with bright, clear lighting
- Include elements like a maintenance checklist or vehicle inspection in progress
- Use green color accents (shades of green #10B981, #059669) subtly in the scene
- The overall mood should be professional, efficient, and time-conscious
- High resolution, photorealistic style, commercial photography quality
- Background should be a clean, modern setting with a clock tower or time-related elements
- The image should convey punctuality, reliability, and respect for passenger time
```

---

### 3. We Are Sustainable Image
**File**: `sustainable.webp`  
**Dimensions**: 1200px × 800px  
**Color Theme**: Emerald/Green tones

**Prompt:**
```
Create a hyper-realistic, professional photograph emphasizing eco-friendly and sustainable taxi service. The image should show:

- A modern, eco-friendly vehicle (hybrid or electric taxi) or a well-maintained fuel-efficient car
- Green elements: plants, eco-friendly symbols, or nature in the background
- The vehicle should appear clean and environmentally conscious
- Include subtle eco-friendly indicators: green badges, carbon offset symbols, or sustainability certifications
- Show a driver or service representative with a green, eco-friendly theme
- The scene should convey environmental responsibility and green initiatives
- Set during daytime with natural, bright lighting
- Use emerald green color accents (shades of #10B981, #059669, #047857) throughout
- The overall mood should be fresh, green, and environmentally conscious
- High resolution, photorealistic style, commercial photography quality
- Background should include natural elements: trees, green spaces, or eco-friendly urban setting
- The image should convey sustainability, environmental care, and green travel
```

---

### 4. Comfort Redefined Image
**File**: `comfort.webp`  
**Dimensions**: 1200px × 800px  
**Color Theme**: Purple tones

**Prompt:**
```
Create a hyper-realistic, professional photograph emphasizing luxury and comfort in taxi service. The image should show:

- A premium, spacious taxi cab interior with luxurious seating
- Show comfortable, reclining seats with ample legroom
- Include modern amenities: charging ports visible, clean interior, air conditioning vents
- The interior should appear spotless, well-maintained, and premium
- Show subtle luxury elements: premium upholstery, reading lights, music system controls
- The scene should convey comfort, relaxation, and a peaceful journey
- Set during daytime with soft, warm lighting that emphasizes comfort
- Use purple color accents (shades of #8B5CF6, #7C3AED, #6D28D9) subtly in the scene
- The overall mood should be luxurious, comfortable, and inviting
- High resolution, photorealistic style, commercial photography quality
- Focus on the interior comfort - spacious, clean, and well-appointed
- The image should convey premium comfort, relaxation, and a delightful travel experience
```

---

## Image Requirements Summary

| Image | File Name | Dimensions | Color Theme | Key Elements |
|-------|-----------|------------|-------------|--------------|
| Safety First | `safety-first.webp` | 1200×800px | Blue (#095FF0) | Driver, safety vest, GPS, first aid |
| Punctual | `punctual.webp` | 1200×800px | Green (#10B981) | Clock, GPS tracking, maintenance |
| Sustainable | `sustainable.webp` | 1200×800px | Emerald (#10B981) | Eco-friendly vehicle, green elements |
| Comfort | `comfort.webp` | 1200×800px | Purple (#8B5CF6) | Luxurious interior, amenities |

---

## Technical Notes

1. **Format**: Use `.webp` format for optimal compression and quality
2. **Optimization**: Compress images to reduce file size (aim for <200KB each)
3. **Fallback**: If images fail to load, gradient backgrounds with icons will show
4. **Responsive**: Images automatically resize based on screen size
5. **Aspect Ratio**: Maintain 3:2 ratio for consistent display

---

## After Generating Images

1. Save all 4 images in `/public/assets/images/` folder
2. Ensure file names match exactly: `safety-first.webp`, `punctual.webp`, `sustainable.webp`, `comfort.webp`
3. Test on both mobile and desktop views
4. Verify images load correctly and fallback works if needed

