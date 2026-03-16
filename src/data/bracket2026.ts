export interface Team {
  seed: number
  name: string
  mascot: string
  record: string
  logo: string
  color: string
  altColor: string
  espnId?: string
  conference: string
  rank?: number
}

export interface Matchup {
  id: string
  round: number
  position: number
  top: Team | null
  bottom: Team | null
  winner?: 'top' | 'bottom'
}

export interface Region {
  name: string
  city: string
  matchups: Matchup[]
}

export interface BracketData {
  year: number
  regions: Record<string, Region>
  finalFour: Matchup[]
  championship: Matchup | null
}

function team(
  seed: number,
  name: string,
  mascot: string,
  record: string,
  color: string,
  altColor: string,
  conference: string,
  rank?: number,
  espnId?: string,
): Team {
  return {
    seed,
    name,
    mascot,
    record,
    logo: espnId
      ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${espnId}.png`
      : '',
    color,
    altColor,
    conference,
    rank,
    espnId,
  }
}

function makeMatchups(teams: Team[]): Matchup[] {
  const seedOrder = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15]
  const ordered = seedOrder.map((s) => teams.find((t) => t.seed === s) ?? null)
  const matchups: Matchup[] = []
  for (let i = 0; i < ordered.length; i += 2) {
    matchups.push({
      id: `r1-${Math.floor(i / 2)}`,
      round: 1,
      position: Math.floor(i / 2),
      top: ordered[i] ?? null,
      bottom: ordered[i + 1] ?? null,
    })
  }
  return matchups
}

// Official 2026 NCAA Tournament bracket (Selection Sunday, March 15, 2026)
const eastTeams: Team[] = [
  team(1, 'Duke', 'Blue Devils', '32-2', '013088', 'ffffff', 'Atlantic Coast Conference', 1, '150'),
  team(2, 'UConn', 'Huskies', '29-5', '0c2340', 'f1f2f3', 'Big East Conference', 6, '41'),
  team(3, 'Michigan State', 'Spartans', '25-7', '18453b', 'ffffff', 'Big Ten Conference', 8, '127'),
  team(4, 'Kansas', 'Jayhawks', '23-10', '0051ba', 'e8000d', 'Big 12 Conference', 14, '2305'),
  team(5, 'St. John\'s', 'Red Storm', '28-6', 'd10000', '101010', 'Big East Conference', 13, '2599'),
  team(6, 'Louisville', 'Cardinals', '23-10', 'c9001f', '000000', 'Atlantic Coast Conference', 24, '97'),
  team(7, 'UCLA', 'Bruins', '23-11', '2774ae', 'f2a900', 'Big Ten Conference', undefined, '26'),
  team(8, 'Ohio State', 'Buckeyes', '21-12', 'ce1141', '505056', 'Big Ten Conference', undefined, '194'),
  team(9, 'TCU', 'Horned Frogs', '22-11', '4d1979', 'f1f2f3', 'Big 12 Conference', undefined, '2628'),
  team(10, 'UCF', 'Knights', '21-11', '000000', 'b4a269', 'Big 12 Conference', undefined, '2116'),
  team(11, 'South Florida', 'Bulls', '24-8', '004A36', '231f20', 'American Conference', undefined, '58'),
  team(12, 'Northern Iowa', 'Panthers', '23-12', '473282', 'ffffff', 'Missouri Valley Conference', undefined, '2460'),
  team(13, 'California Baptist', 'Lancers', '25-8', '000080', '000080', 'Western Athletic Conference', undefined, '2856'),
  team(14, 'North Dakota State', 'Bison', '27-7', '01402A', 'ffffff', 'Summit League', undefined, '2449'),
  team(15, 'Furman', 'Paladins', '22-12', '582c83', 'ffffff', 'Southern Conference', undefined, '231'),
  team(16, 'Siena', 'Saints', '23-11', '037961', 'eea60f', 'Metro Atlantic Athletic Conference', undefined, '2561'),
]

const westTeams: Team[] = [
  team(1, 'Arizona', 'Wildcats', '32-2', '0c234b', 'ab0520', 'Big 12 Conference', 2, '12'),
  team(2, 'Purdue', 'Boilermakers', '26-8', '000000', 'cfb991', 'Big Ten Conference', 18, '2509'),
  team(3, 'Gonzaga', 'Bulldogs', '30-3', '041e42', 'c8102e', 'West Coast Conference', 12, '2250'),
  team(4, 'Arkansas', 'Razorbacks', '25-8', 'a41f35', 'ffffff', 'Southeastern Conference', 17, '8'),
  team(5, 'Wisconsin', 'Badgers', '24-10', 'c4012f', 'ffffff', 'Big Ten Conference', 23, '275'),
  team(6, 'BYU', 'Cougars', '23-11', '003da5', 'ffffff', 'Big 12 Conference', undefined, '252'),
  team(7, 'Miami', 'Hurricanes', '25-8', '005030', 'f47321', 'Atlantic Coast Conference', undefined, '2390'),
  team(8, 'Villanova', 'Wildcats', '24-8', '00205b', '13b5ea', 'Big East Conference', undefined, '222'),
  team(9, 'Utah State', 'Aggies', '28-6', '00263a', '949ca1', 'Mountain West Conference', undefined, '328'),
  team(10, 'Missouri', 'Tigers', '20-12', 'f1b82d', '000000', 'Southeastern Conference', undefined, '142'),
  team(11, 'NC State', 'Wolfpack', '20-13', 'cc0000', 'ffffff', 'Atlantic Coast Conference', undefined, '152'),
  team(12, 'High Point', 'Panthers', '30-4', 'b0b7bc', 'ebebeb', 'Big South Conference', undefined, '2272'),
  team(13, 'Hawai\'i', 'Rainbow Warriors', '24-8', '003420', 'ffffff', 'Big West Conference', undefined, '62'),
  team(14, 'Kennesaw State', 'Owls', '21-13', 'fdbb30', '000000', 'Conference USA', undefined, '338'),
  team(15, 'Queens', 'Royals', '24-8', '002d6c', 'c8a557', 'ASUN Conference', undefined, undefined),
  team(16, 'Long Island University', 'Sharks', '24-10', '50c9f7', 'ffbf00', 'Northeast Conference', undefined, '112358'),
]

const southTeams: Team[] = [
  team(1, 'Florida', 'Gators', '26-7', '0021a5', 'fa4616', 'Southeastern Conference', 4, '57'),
  team(2, 'Houston', 'Cougars', '28-6', 'c92a39', 'ffffff', 'Big 12 Conference', 5, '248'),
  team(3, 'Illinois', 'Fighting Illini', '24-8', 'ff5f05', '13294b', 'Big Ten Conference', 9, '356'),
  team(4, 'Nebraska', 'Cornhuskers', '26-6', 'd00000', 'ffffff', 'Big Ten Conference', 11, '158'),
  team(5, 'Vanderbilt', 'Commodores', '26-7', '000000', '231f20', 'Southeastern Conference', 22, '238'),
  team(6, 'North Carolina', 'Tar Heels', '24-8', '7bafd4', '13294b', 'Atlantic Coast Conference', 19, '153'),
  team(7, 'Saint Mary\'s', 'Gaels', '27-5', 'd80024', '003057', 'West Coast Conference', 21, '2608'),
  team(8, 'Clemson', 'Tigers', '24-10', 'f56600', '522d80', 'Atlantic Coast Conference', undefined, '228'),
  team(9, 'Iowa', 'Hawkeyes', '21-12', '000000', 'fcd116', 'Big Ten Conference', undefined, '2294'),
  team(10, 'Texas A&M', 'Aggies', '21-11', '500000', 'ffffff', 'Southeastern Conference', undefined, '245'),
  team(11, 'VCU', 'Rams', '26-7', 'ffaf00', '000000', 'Atlantic 10 Conference', undefined, '2670'),
  team(12, 'McNeese', 'Cowboys', '28-5', '00529C', 'ffd204', 'Southland Conference', undefined, '2377'),
  team(13, 'Troy', 'Trojans', '22-11', 'AE0210', '88898c', 'Sun Belt Conference', undefined, '2653'),
  team(14, 'Penn', 'Quakers', '17-11', '082A74', 'a6163d', 'Ivy League', undefined, '219'),
  team(15, 'Idaho', 'Vandals', '21-14', '000000', '8c6e4a', 'Big Sky Conference', undefined, '70'),
  team(16, 'Lehigh', 'Mountain Hawks', '18-16', '6c2b2a', 'b69e70', 'Patriot League', undefined, '2329'),
]

const midwestTeams: Team[] = [
  team(1, 'Michigan', 'Wolverines', '31-2', '00274c', 'ffcb05', 'Big Ten Conference', 3, '130'),
  team(2, 'Iowa State', 'Cyclones', '27-7', '822433', 'fdca2f', 'Big 12 Conference', 7, '66'),
  team(3, 'Virginia', 'Cavaliers', '29-5', '232d4b', 'f84c1e', 'Atlantic Coast Conference', 10, '258'),
  team(4, 'Alabama', 'Crimson Tide', '23-9', '9e1632', 'ffffff', 'Southeastern Conference', 15, '333'),
  team(5, 'Texas Tech', 'Red Raiders', '22-10', '000000', 'da291c', 'Big 12 Conference', 16, '2641'),
  team(6, 'Tennessee', 'Volunteers', '22-11', 'ff8200', '58595b', 'Southeastern Conference', 25, '2633'),
  team(7, 'Kentucky', 'Wildcats', '21-13', '0033a0', 'ffffff', 'Southeastern Conference', undefined, '96'),
  team(8, 'Georgia', 'Bulldogs', '22-10', 'ba0c2f', 'ffffff', 'Southeastern Conference', undefined, '61'),
  team(9, 'Saint Louis', 'Billikens', '28-5', '00539C', 'ebebeb', 'Atlantic 10 Conference', undefined, '139'),
  team(10, 'Santa Clara', 'Broncos', '26-8', '690b0b', '101010', 'West Coast Conference', undefined, '2541'),
  team(11, 'SMU', 'Mustangs', '20-13', '354ca1', 'cc0035', 'Atlantic Coast Conference', undefined, '2567'),
  team(12, 'Akron', 'Zips', '29-5', '00285e', '84754e', 'Mid-American Conference', undefined, '2006'),
  team(13, 'Hofstra', 'Pride', '24-10', '003594', 'ffc72c', 'Coastal Athletic Association', undefined, '2275'),
  team(14, 'Wright State', 'Raiders', '23-11', 'cba052', 'cba052', 'Horizon League', undefined, '2750'),
  team(15, 'Tennessee State', 'Tigers', '23-9', '171796', 'f0f0f0', 'Ohio Valley Conference', undefined, '2634'),
  team(16, 'Howard', 'Bison', '23-10', '003a63', 'e51937', 'Mid-Eastern Athletic Conference', undefined, '47'),
]

export const projected2026Bracket: BracketData = {
  year: 2026,
  regions: {
    east: { name: 'East', city: 'Washington D.C.', matchups: makeMatchups(eastTeams) },
    west: { name: 'West', city: 'San Jose', matchups: makeMatchups(westTeams) },
    south: { name: 'South', city: 'Houston', matchups: makeMatchups(southTeams) },
    midwest: { name: 'Midwest', city: 'Chicago', matchups: makeMatchups(midwestTeams) },
  },
  finalFour: [],
  championship: null,
}

export function getAllTeams(): Team[] {
  return Object.values(projected2026Bracket.regions).flatMap((region) =>
    region.matchups.flatMap((m) => [m.top, m.bottom].filter(Boolean) as Team[]),
  )
}

export function getTeamByName(name: string): Team | undefined {
  return getAllTeams().find((t) => t.name === name)
}
