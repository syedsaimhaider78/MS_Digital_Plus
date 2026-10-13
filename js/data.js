/**
 * MS Digital NET Plus — Site Data
 * Business details, coverage areas, packages, and services configuration.
 */

window.SITE_CONFIG = {
  businessName: 'MS Digital NET Plus',
  tagline: 'Supported by GPON (5G)',
  owner: 'Bilawal Younas',
  ownerTitle: 'Founder & CEO',
  phone: '03054020019',
  phoneDisplay: '0305-4020019',
  whatsapp: '923054020019',
  email: 'bilawal.ali1991@gmail.com',
  address: 'Office No. 13, Main Street, Muhammadpura Side, Faisal Town D Block, Lahore',
  hours: '24/7',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.5!2d74.2285!3d31.4505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFaisal+Town+D+Block%2C+Lahore!5e0!3m2!1sen!2spk!4v1',
  social: {
    facebook: '#',
    instagram: '#',
  },
  ownerBio: 'Bilawal Younas is the driving force behind MS Digital NET Plus, bringing high-speed fiber internet powered by GPON technology to the communities of Lahore. His vision is to deliver reliable, affordable connectivity with genuine 24/7 support that local families and businesses can count on.',
  stats: [
    { value: 2000, suffix: '+', label: 'Happy Customers', placeholder: false },
    { value: 16, suffix: '', label: 'Areas Covered', placeholder: false },
    { value: 5, suffix: '+ Years', label: 'Experience', placeholder: false },
    { value: 24, suffix: '/7', label: 'Support Available', placeholder: false }
  ],
  coveredAreas: [
    'D Block',
    'C Block',
    'KhotaPind Flats',
    'MOON Market',
    'Link Road',
    'Pace Side',
    'Amanah Mall Side',
    'Honda Moor',
    'Bhatti Colony',
    'Muhammadpura Side',
    'Main Market Side',
    'Faisal Town Surrounding',
    'Township Mobile Market',
    'Lahore Plaza',
    'Glamour Plaza',
    'Ideal Center'
  ],
  ipOfferNote: 'We offer both Dynamic IP and dedicated Static IP as per your demand. Package rates adjust based on IP preference and custom bandwidth requirements.'
};

window.PACKAGES = [
  { id: 1, speed: 10, unit: 'Mbps', category: 'starter', badge: 'Starter', popular: false },
  { id: 2, speed: 15, unit: 'Mbps', category: 'starter', badge: 'Starter', popular: false },
  { id: 3, speed: 20, unit: 'Mbps', category: 'starter', badge: 'Starter', popular: false },
  { id: 4, speed: 25, unit: 'Mbps', category: 'standard', badge: 'Standard', popular: false },
  { id: 5, speed: 30, unit: 'Mbps', category: 'standard', badge: 'Standard', popular: false },
  { id: 6, speed: 40, unit: 'Mbps', category: 'standard', badge: 'Standard', popular: false },
  { id: 7, speed: 50, unit: 'Mbps', category: 'super', badge: 'SUPER', popular: true },
  { id: 8, speed: 75, unit: 'Mbps', category: 'super', badge: 'SUPER', popular: false },
  { id: 9, speed: 100, unit: 'Mbps', category: 'super', badge: 'SUPER', popular: false }
];

window.SERVICES = [
  {
    title: 'High-Speed Fiber Internet',
    desc: 'Blazing-fast GPON fiber-optic connections delivering consistent speeds to your doorstep.',
    icon: 'fiber'
  },
  {
    title: 'Wi-Fi Installation & Setup',
    desc: 'Professional Wi-Fi setup and optimization for complete coverage in your home or office.',
    icon: 'wifi'
  },
  {
    title: 'Network Maintenance',
    desc: 'Proactive monitoring and maintenance to keep your connection running at peak performance.',
    icon: 'maintenance'
  },
  {
    title: 'Business Solutions',
    desc: 'Dedicated internet solutions designed for businesses that need uninterrupted connectivity.',
    icon: 'business'
  },
  {
    title: 'Residential Plans',
    desc: 'Affordable high-speed internet plans tailored for everyday home use and streaming.',
    icon: 'home'
  },
  {
    title: '24/7 Technical Support',
    desc: 'Round-the-clock technical assistance — call us anytime, day or night.',
    icon: 'support'
  }
];
