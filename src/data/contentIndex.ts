// Content index for site-wide search
// This file indexes all actual page content for intelligent search

export interface ContentItem {
  title: string;
  path: string;
  content: string;
  category: string;
  priority: number; // Higher = more important
}

// Comprehensive content index extracted from all pages
export const contentIndex: ContentItem[] = [
  // Home/Index page
  {
    title: "Home",
    path: "/",
    content: "CDBL Rockets Baseball League Burlington Illinois youth baseball registration season schedule teams travel in-house programs community",
    category: "Main",
    priority: 100,
  },

  // About page
  {
    title: "About CDBL",
    path: "/about",
    content: "About CDBL Central District Baseball League mission history founded 1987 38 years Burlington Illinois non-profit youth baseball skill development teamwork sportsmanship excellence integrity community Core Values Travel Program Begins 2003 Rockets competitive Main Complex Board of Directors Jason Taylor President Humberto Camacho Vice President Todd Weachter Treasurer Carrie Wolak Secretary 400 players annually 50 teams 100 volunteers",
    category: "About",
    priority: 90,
  },

  // Teams page - In-House
  {
    title: "Teams & Rosters - In-House League",
    path: "/teams",
    content: "Teams Rosters In-House League T-Ball Division Ages 4-6 Pinto Division Ages 7-8 Coach Pitch Bronco Division Ages 9-10 Player Pitch Mustang Pony Division Ages 11-12 Colt Division Ages 13-14 recreational teams balanced competitive play 2026 Registration Now Open",
    category: "Teams",
    priority: 95,
  },

  // Teams page - Travel
  {
    title: "CDBL Rockets Travel Program",
    path: "/teams",
    content: "CDBL Rockets Travel Program competitive travel teams tournaments region tryouts annually 8U Rockets 10U Rockets 12U Rockets 14U Rockets Regional Champions State Qualifier State Tournament Travel Tryout Information Saturday March 8 2026 Sunday March 9 2026 callback sessions what to bring baseball glove bat helmet cleats athletic cup water bottle Travel Registration Tryouts Born 2018 2019 2016 2017 2014 2015 2012 2013 Head Coach Mike Johnson Dave Martinez Tom Anderson Steve Roberts",
    category: "Teams",
    priority: 95,
  },

  // Registration page
  {
    title: "Register for 2026 Season",
    path: "/registration",
    content: "Register Registration 2026 Season SportsConnect Early Registration December 1 2025 Regular Registration January 15 2026 Late Registration March 1 2026 Season Starts April 2026 Registration Fees T-Ball $75 Pinto $95 Bronco $115 Pony $135 Colt $155 Official CDBL jersey team hat 12-16 game season professional coaching tournament opportunities In-House vs Travel Baseball comparison In-House League recreational local fields no tryouts all players accepted Travel Baseball competitive tryouts required regional tournaments weekend trips 50+ games March August $600 per season tournament fees advanced competition elite players experienced players Travel right for my child multiple seasons strong fundamental skills passionate about baseball weekend tournaments practice schedules travel expenses scholarships financial assistance sibling discounts family caps refund policy equipment volunteer commitments evaluations draft",
    category: "Registration",
    priority: 100,
  },

  // Rules page
  {
    title: "Rules & Policies",
    path: "/rules",
    content: "Rules Policies CDBL Constitution playing rules league policies T-Ball Division Pinto Mustang Bronco Other Rules Article Name Objectives Membership League Fees Meetings Executive Board of Directors Committees Officers Duties Powers Managers Coaches Umpires Players Affiliation Financial Accounting Travel and Tournament Teams Travel teams represent CDBL competitive tournaments Try-outs team selection additional fees travel programs tournament teams organized specific events Travel coordinator oversees travel programs Rules Regulations Amendments Code of Conduct Family Code of Conduct sportsmanship respect officials decisions no profane language no violence positive experience pitch counts player safety call-up rules division coordinator",
    category: "Rules",
    priority: 85,
  },

  // Schedule page
  {
    title: "Season Schedule",
    path: "/schedule",
    content: "Season Schedule 2026 game schedule practice times field assignments division schedules T-Ball Pinto Bronco Mustang Pony Colt Travel teams calendar events tournament schedule playoffs championship games",
    category: "Season Info",
    priority: 90,
  },

  // Fields page
  {
    title: "Fields & Facilities",
    path: "/fields",
    content: "Fields Facilities CDBL Main Complex Championship Field practice fields directions parking concessions restrooms lighting systems four regulation fields professional lighting evening games Burlington Illinois Central District location map amenities",
    category: "About",
    priority: 75,
  },

  // Events page
  {
    title: "Events & Calendar",
    path: "/events",
    content: "Events Calendar Opening Day Ceremony tryouts evaluations draft picture day team photos playoff games championship tournament concession stand volunteer shifts fundraising events community activities family fun night sponsor appreciation",
    category: "Season Info",
    priority: 80,
  },

  // New to CDBL page
  {
    title: "New to CDBL",
    path: "/new-to-cdbl",
    content: "New to CDBL orientation guide getting started first time player what to expect registration process equipment needed practice schedule game day tips parent guide volunteer opportunities coaching opportunities frequently asked questions FAQ beginners welcome youth baseball introduction",
    category: "Get Involved",
    priority: 85,
  },

  // Volunteer page
  {
    title: "Volunteer Opportunities",
    path: "/volunteer",
    content: "Volunteer Opportunities coaching assistant coach team manager umpire concessions stand field maintenance groundskeeping opening day setup event help fundraising committee board member registration help scorekeeping announcer photography community service give back make a difference parent involvement background check required",
    category: "Get Involved",
    priority: 70,
  },

  // Shop page
  {
    title: "Spirit Wear & Shop",
    path: "/shop",
    content: "Spirit Wear Shop CDBL merchandise apparel jerseys hats t-shirts hoodies sweatshirts team gear custom uniforms spirit wear online store proceeds support league fundraising products team pride collection",
    category: "Get Involved",
    priority: 65,
  },

  // Sponsors page
  {
    title: "Sponsors & Partners",
    path: "/sponsors",
    content: "Sponsors Partners community support local businesses sponsorship opportunities become a sponsor diamond platinum gold silver bronze packages advertising recognition signage banner logo website thank you sponsors support CDBL contributions donations partner with us",
    category: "About",
    priority: 60,
  },

  // Board Info page
  {
    title: "Board of Directors",
    path: "/board",
    content: "Board of Directors meeting schedules board meetings minutes agenda election information voting annual meeting September officers President Vice President Secretary Treasurer board members directors committees Executive Board governance leadership Jason Taylor Humberto Camacho Todd Weachter Carrie Wolak",
    category: "About",
    priority: 70,
  },

  // Contact page
  {
    title: "Contact Us",
    path: "/contact",
    content: "Contact Us get in touch email phone address Burlington Illinois questions comments concerns registration help board members contact information President Vice President Treasurer Secretary feedback inquiries general information support help desk",
    category: "Get Involved",
    priority: 75,
  },
];
