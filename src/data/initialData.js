export const initialData = {
  siteInfo: {
    name: 'Mannin Maindhan Grama Arakkattalai',
    nameTamil: 'மண்ணின் மைந்தன் கிராம அறக்கட்டளை',
    shortName: 'MMG Trust',
    tagline: 'Building Stronger Villages. Creating Lasting Change.',
    taglineTamil: 'கிராம சமூகங்களை மேம்படுத்துதல், வாழ்க்கையை வளப்படுத்துதல்',
    heroHeading: 'Building Stronger Villages. Creating Lasting Change.',
    heroSubheading:
      'Working alongside rural communities to improve access to education, clean water, healthcare, livelihoods, and a sustainable future.',
    email: 'sonofsoiltrust@gmail.com',
    phone: '+91 9994291195',
    phoneFormatted: '+91 99942 91195',
    phoneRaw: '+919994291195',
    whatsappNumber: '919994291195',
    whatsappUrl:
      'https://wa.me/919994291195?text=Hello%20Mannin%20Maindhan%20Grama%20Arakkattalai%2C%20I%20would%20like%20to%20connect%20with%20your%20team.',
    address: '2/119, Eruthukuttahalli village, Palacode taluk, Dharmapuri - 636808',
    locationShort: 'Palacode, Dharmapuri - 636808',
    district: 'Dharmapuri',
    state: 'Tamil Nadu',
    pincode: '636808',
    founded: '2024',
    logoFull: '/images/originalLogo.jpeg',
    logoBadge: '/images/originalLogo.jpeg',
    heroImage: '/images/hero-village.jpg',
    missionStatement:
      'To empower rural communities across Dharmapuri and Tamil Nadu by providing sustainable access to quality education, safe drinking water, holistic healthcare, drug awareness, and eco-friendly livelihood solutions.',
    visionStatement:
      'A self-reliant, enlightened, and healthy rural society where every village community thrives in harmony with nature and enjoys equitable opportunities.',
    announcementBanner: '🌱 Monsoon Village Tree Plantation Drive - Join our weekend volunteers in Palacode!',
    announcementActive: true,
    primaryCtaText: 'Support Our Mission',
    secondaryCtaText: 'Become a Volunteer',
    footerAboutText:
      'A community-rooted charitable trust dedicated to holistic rural development in Dharmapuri and across Tamil Nadu through education, clean water, healthcare, environmental protection, and sustainable livelihoods.',
    footerCopyright: 'Mannin Maindhan Grama Arakkattalai. All rights reserved. Registered Charitable Trust.',
  },

  impact: {
    stats: [
      {
        id: 'stat-programmes',
        key: 'programmes',
        label: 'Programmes',
        labelTamil: 'முக்கிய திட்டங்கள்',
        value: '9',
        icon: 'FolderKanban',
        description: 'Core developmental verticals in active implementation',
      },
      {
        id: 'stat-villages',
        key: 'villages',
        label: 'Villages Reached',
        labelTamil: 'பயனடைந்த கிராமங்கள்',
        value: '45+',
        icon: 'MapPin',
        description: 'Rural hamlets engaged across Palacode & Dharmapuri taluks',
      },
      {
        id: 'stat-people',
        key: 'people',
        label: 'People Supported',
        labelTamil: 'பயனடைந்த பொதுமக்கள்',
        value: '12,500+',
        icon: 'Users',
        description: 'Children, farmers, self-help groups and rural elders',
      },
      {
        id: 'stat-projects',
        key: 'projects',
        label: 'Community Projects',
        labelTamil: 'நிறைவேற்றப்பட்ட பணிகள்',
        value: '68+',
        icon: 'CheckCircle2',
        description: 'Water points, study circles, afforestation and health camps',
      },
    ],
  },

  programmes: [
    {
      id: 'prog-education',
      slug: 'education',
      title: 'Education',
      fullTitle: 'Rural Education & Learning Centres',
      titleTamil: 'கிராமப்புற கல்வி மேம்பாடு',
      category: 'Education',
      icon: 'GraduationCap',
      imageUrl:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      description:
        'Providing supplemental evening tuition, notebooks, learning kits, and mentorship to first-generation students in underserved rural hamlets.',
      details:
        'Focuses on reducing drop-out rates, promoting foundational literacy and numeracy, and creating safe, well-lit village study spaces.',
      highlights: ['Village Study Centres', 'Notebook & School Kit Drives', 'Higher Education Guidance'],
      projects: [
        {
          id: 'proj-edu-1',
          title: 'Village Evening Study Support Circles',
          description:
            'Organising supervised evening learning circles with volunteer tutors to provide homework assistance and foundational numeracy support for rural school children.',
          location: 'Palacode Taluk (Specific hamlet centres pending trust confirmation)',
          date: 'Proposed Initiative (2025 Cycle)',
          images: [
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-edu-2',
          title: 'School Learning Kit & Notebook Support Drive',
          description:
            'Annual educational supply drives providing essential writing books, mathematical kits, and school bags to underprivileged students across rural government schools.',
          location: 'Rural schools across Dharmapuri district (Partner schools pending confirmation)',
          date: 'Upcoming Academic Cycle',
          images: [
            'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
    {
      id: 'prog-livelihood-women',
      slug: 'livelihood-development-women-empowerment',
      title: 'Livelihood Development and Women Empowerment',
      fullTitle: 'Rural Livelihood & Women Empowerment Initiative',
      titleTamil: 'வாழ்வாதாரம் மற்றும் மகளிர் மேம்பாடு',
      category: 'Livelihood Development and Women Empowerment',
      icon: 'Briefcase',
      imageUrl:
        'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
      description:
        'Empowering marginal farmers, women self-help groups, and rural youth with sustainable agricultural methods, vocational skills, and micro-enterprise guidance.',
      details:
        'Supports women-led self-help micro-enterprises, organic cultivation practices, value addition to local farm produce, and vocational training in tailoring, crafts, and digital skills.',
      highlights: ['Women Self-Help Groups', 'Organic Farming Workshops', 'Micro-Enterprise & Skill Training'],
      projects: [
        {
          id: 'proj-live-1',
          title: 'Women Self-Help Group Tailoring & Handicrafts Collective',
          description:
            'Vocational skill-building modules designed to equip rural women with sewing, tailoring, and eco-friendly packaging skills to generate home-based auxiliary income.',
          location: 'Eruthukuttahalli & neighbouring clusters (Centre venue pending confirmation)',
          date: 'Planning Phase (2025)',
          images: [
            'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-live-2',
          title: 'Dryland Organic Farming & Millet Processing Demonstrations',
          description:
            'Hands-on demonstrations for smallholder farmers on organic bio-inputs, traditional millets cultivation, and direct rural market linkages.',
          location: 'Dharmapuri agricultural tracts (Demonstration plots to be confirmed)',
          date: 'Seasonal Agricultural Window',
          images: [
            'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
    {
      id: 'prog-drug-free-sports',
      slug: 'drug-free-communities-sports-development',
      title: 'Drug-Free Communities and Sports Development',
      fullTitle: 'Drug-Free Society & Rural Sports Development',
      titleTamil: 'போதையற்ற சமமூக மற்றும் விளையாட்டு மேம்பாடு',
      category: 'Drug-Free Communities and Sports Development',
      icon: 'ShieldCheck',
      imageUrl:
        'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
      description:
        'Conducting anti-substance abuse campaigns, village sports leagues, and peer counselling to foster healthy, empowered, and constructive rural youth.',
      details:
        'Collaborates with village elders, local schools, and rural youth sports clubs to organize cricket, kabaddi, and athletic tournaments alongside substance abuse awareness workshops.',
      highlights: ['Substance Awareness Drives', 'Village Sports Leagues', 'Youth & Family Counselling'],
      projects: [
        {
          id: 'proj-sport-1',
          title: 'Annual Rural Youth Kabaddi & Volleyball Tournament',
          description:
            'Grassroots athletic tournaments organised across rural hamlets to build physical endurance, cultivate sportsman spirit, and channel youth energy into community sports.',
          location: 'Palacode Community Grounds (Tournament venue pending confirmation)',
          date: 'Upcoming Season',
          images: [
            'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-sport-2',
          title: 'Substance Abuse Awareness & Youth De-Addiction Counselling',
          description:
            'Community awareness campaigns and family counselling sessions aimed at deterring drug and tobacco usage among rural teenagers and young adults.',
          location: 'Village panchayat centres (Schedule to be finalized)',
          date: 'Awareness Campaign Cycle',
          images: [
            'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
    {
      id: 'prog-environment-energy',
      slug: 'environmental-protection-renewable-energy',
      title: 'Environmental Protection and Renewable Energy',
      fullTitle: 'Afforestation, Biodiversity & Clean Solar Energy',
      titleTamil: 'சுற்றுச்சூழல் பாதுகாப்பு மற்றும் புதுப்பிக்கத்தக்க ஆற்றல்',
      category: 'Environmental Protection and Renewable Energy',
      icon: 'TreePine',
      imageUrl:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      description:
        'Mass plantation of indigenous shade and fruit-bearing trees, seed-ball scattering, and decentralized solar lighting for sustainable rural habitations.',
      details:
        'Preserves native trees such as Neem, Pungan, Peepal, and Tamarind suited to Dharmapuri climatic conditions, combined with rural solar lighting points and clean energy literacy.',
      highlights: ['Native Tree Plantations', 'Solar Street Illumination', 'School Green Clubs'],
      projects: [
        {
          id: 'proj-env-1',
          title: 'Native Tree Sapling Plantation & Seed-Ball Dispersal Drive',
          description:
            'Mass community planting of indigenous tree varieties suited to semi-arid climates (Neem, Tamarind, Pungan) to enhance green canopy and reduce soil erosion.',
          location: 'Palacode roadsides & village commons (Planting sites pending confirmation)',
          date: 'Monsoon Plantation Schedule',
          images: [
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-env-2',
          title: 'Village Solar Lighting & Clean Energy Literacy',
          description:
            'Surveys and installations of standalone solar LED street units in remote hamlet lanes to increase safety and promote renewable energy awareness.',
          location: 'Selected unelectrified hamlet stretches (Site list pending survey)',
          date: 'Technical Survey Phase',
          images: [
            'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
    {
      id: 'prog-sanitation-healthcare',
      slug: 'sanitation-healthcare',
      title: 'Sanitation and Healthcare',
      fullTitle: 'Rural Sanitation & Community Health Initiatives',
      titleTamil: 'சுகாதாரம் மற்றும் மருத்துவ நல்வாழ்வு',
      category: 'Sanitation and Healthcare',
      icon: 'HeartPulse',
      imageUrl:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      description:
        'Advancing village hygiene, safe sanitation, waste segregation, and conducting preventive health screenings and medical camps in rural hamlets.',
      details:
        'Combines volunteer-led village cleanliness drives and menstrual hygiene awareness with doorstep health screenings, geriatric checkups, eye camps, and basic medicines.',
      highlights: ['Free Medical Screenings', 'Village Cleanliness Drives', 'Hygiene & Health Awareness'],
      projects: [
        {
          id: 'proj-san-1',
          title: 'Comprehensive Rural Preventive Health Screening Camp',
          description:
            'Free medical camps providing geriatric health assessments, blood pressure checks, diabetes screening, and eye examinations for village elders and farm labourers.',
          location: 'Eruthukuttahalli Community Center (Partner medical team pending confirmation)',
          date: 'Quarterly Medical Schedule',
          images: [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-san-2',
          title: 'Village Cleanliness (Shramdaan) & Drain Clearance Initiative',
          description:
            'Youth volunteer campaigns to clear stagnant street drain lines, eliminate mosquito breeding grounds, and conduct household hygiene demonstrations.',
          location: 'Selected village wards across Palacode (Ward list to be confirmed)',
          date: 'Community Shramdaan Calendar',
          images: [
            'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
    {
      id: 'prog-water-management',
      slug: 'community-water-management',
      title: 'Community Water Management',
      fullTitle: 'Pond Restoration & Traditional Water Conservation',
      titleTamil: 'சமூக நீர் மேலாண்மை மற்றும் ஏரி புனரமைப்பு',
      category: 'Community Water Management',
      icon: 'Waves',
      imageUrl:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      description:
        'Revitalizing traditional village ponds (oorani), clearing monsoon water inlet channels, and building check dams for groundwater recharge.',
      details:
        'Re-establishes customary community water stewardship (Kudimaramathu), ensuring agriculture and livestock have sufficient seasonal water reserves.',
      highlights: ['Traditional Pond Desilting', 'Inflow Channel Clearance', 'Rainwater Harvesting Checks'],
      projects: [
        {
          id: 'proj-wat-1',
          title: 'Traditional Village Pond (Oorani) Revival & Desilting',
          description:
            'Deepening historical rain retention ponds and strengthening earthen bunds to augment monsoon water harvesting for domestic cattle and recharge shallow village wells.',
          location: 'Palacode Taluk waterbodies (Oorani registry pending confirmation)',
          date: 'Pre-Monsoon Season',
          images: [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
        {
          id: 'proj-wat-2',
          title: 'Agricultural Feeder Canal Clearance & Scrub Removal',
          description:
            'Community-led clearance of invasive Prosopis juliflora and silt blockage along natural irrigation feeder channels to ensure unobstructed monsoon runoff to local tanks.',
          location: 'Village tank canal network (Channel stretch pending verification)',
          date: 'Seasonal Canal Maintenance',
          images: [
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
          ],
          videoUrl: null,
          isPlaceholder: true,
          placeholderNotice: 'Project information will be added after confirmation.',
        },
      ],
      status: 'active',
      isDemo: true,
    },
  ],

  campaigns: [],

  stories: [],

  transparencyLinks: [
    {
      title: 'About the Trust',
      titleTamil: 'அறக்கட்டளை நோக்கம்',
      description: 'Founding principles, mission roadmap, and trustees’ commitment to rural Tamil Nadu.',
      to: '/about',
      badge: 'Governance',
    },
    {
      title: 'Community Programmes',
      titleTamil: 'செயல்திட்டங்கள்',
      description: 'Detailed overview of 6 active development verticals and village coverage.',
      to: '/programmes',
      badge: 'Operations',
    },
    {
      title: 'Impact Verification',
      titleTamil: 'தாக்கம் & கண்காணிப்பு',
      description: 'Field metrics, monitoring framework, and progress reporting protocol.',
      to: '/impact',
      badge: 'Accountability',
    },
    {
      title: 'Official Reports & Compliance',
      titleTamil: 'அறிக்கைகள் & சான்றிதழ்கள்',
      description:
        'Official trust registration records and compliance filings will be published once fully certified.',
      to: '/about',
      badge: 'Transparency',
    },
  ],

  volunteerOpportunities: [],

  volunteerApplications: [],

  // Synchronised alias for legacy code
  volunteers: [],

  careers: [],

  jobApplications: [],

  gallery: [],

  contactEnquiries: [],

  demoDonations: [],
};
