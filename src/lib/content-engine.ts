import type { SEOArea, SEOService, SEOProblem } from "@/data/seo-data";

// Generates genuinely unique content per area+service/problem combination
// by using area attributes (housing era, soil type, flood risk, water hardness, etc.)

export function generateServiceAreaContent(area: SEOArea, service: SEOService) {
  const sections: string[] = [];

  // Section 1: Area-specific intro tied to service
  sections.push(getServiceAreaIntro(area, service));

  // Section 2: Why this area needs this service (based on attributes)
  sections.push(getWhyAreaNeedsService(area, service));

  // Section 3: Area-specific cost factors
  sections.push(getCostFactors(area, service));

  // Section 4: Local considerations
  sections.push(getLocalConsiderations(area, service));

  return sections;
}

export function generateProblemAreaContent(area: SEOArea, problem: SEOProblem) {
  const sections: string[] = [];

  sections.push(getProblemAreaIntro(area, problem));
  sections.push(getWhyAreaHasProblem(area, problem));
  sections.push(getProblemLocalAdvice(area, problem));

  return sections;
}

export function generateAreaLandingContent(area: SEOArea) {
  const sections: string[] = [];

  sections.push(getAreaOverview(area));
  sections.push(getAreaPlumbingChallenges(area));
  sections.push(getAreaHomeProfile(area));

  return sections;
}

// --- Service + Area Content Generators ---

function getServiceAreaIntro(area: SEOArea, service: SEOService): string {
  const eraNote = getEraServiceNote(area, service);
  return `${area.name} homeowners searching for ${service.name.toLowerCase()} have specific needs shaped by the neighborhood's ${area.housingStyle.toLowerCase()}. Most homes here were built during the ${area.housingEra} era and use ${area.commonPipeType} plumbing. ${eraNote} Our directory connects you with licensed plumbers in the ${area.zipCode} area who specialize in ${service.name.toLowerCase()} for ${area.housingEra}-era ${area.region === 'inner-loop' ? 'inner-loop' : area.region} homes.`;
}

function getEraServiceNote(area: SEOArea, service: SEOService): string {
  const slug = service.slug;

  if (area.housingEra === 'pre-1950') {
    if (slug.includes('repipe') || slug.includes('pipe')) return `Pre-1950 homes in ${area.name} typically have galvanized steel pipes that are well past their 50-year lifespan, making corrosion and low water pressure common complaints near ${area.nearbyLandmark}.`;
    if (slug.includes('drain') || slug.includes('sewer')) return `The original clay sewer lines in ${area.name}'s pre-1950 homes are highly susceptible to root intrusion from the area's mature trees, especially the live oaks common near ${area.nearbyLandmark}.`;
    if (slug.includes('water-heater')) return `Many pre-1950 homes in ${area.name} have undersized water lines that can affect water heater performance, requiring careful sizing and sometimes line upgrades during installation.`;
    return `Working on pre-1950 plumbing in ${area.name} requires specialized knowledge of galvanized steel connections and potential lead solder joints common in homes near ${area.nearbyLandmark}.`;
  }
  if (area.housingEra === '1950s-1960s') {
    if (slug.includes('drain') || slug.includes('sewer')) return `${area.name}'s mid-century homes may still have Orangeburg (tar paper) sewer pipes that deteriorate and collapse — a problem that camera inspection easily identifies before it becomes an emergency.`;
    if (slug.includes('repipe') || slug.includes('pipe')) return `Cast iron drain lines and galvanized supply pipes in ${area.name}'s 1950s-60s homes are reaching end-of-life, with interior corrosion reducing flow and causing discolored water.`;
    return `Mid-century homes near ${area.nearbyLandmark} in ${area.name} often have a mix of cast iron and galvanized plumbing that requires experienced handling during ${service.name.toLowerCase()} work.`;
  }
  if (area.housingEra === '1970s-1980s') {
    if (slug.includes('repipe') || slug.includes('pipe') || slug.includes('leak')) return `${area.name} homes from the 1970s-80s may contain polybutylene (poly-B) pipes — a material prone to sudden failure. If your ${area.name} home has gray plastic pipes, proactive repiping is strongly recommended.`;
    if (slug.includes('slab') || slug.includes('foundation')) return `The ${area.soilType} soil under ${area.name}'s 1970s-80s slab foundations is especially prone to movement, making slab leak detection and repair a frequent need in the ${area.zipCode} zip code.`;
    return `Homes in ${area.name} built during the 1970s-80s commonly have copper supply lines that may be developing pinhole leaks after 40+ years, particularly in homes near ${area.nearbyLandmark}.`;
  }
  if (area.housingEra === '1990s-2000s') {
    if (slug.includes('water-heater')) return `Most water heaters in ${area.name}'s 1990s-2000s homes are original or first-replacement units — at 15-25 years old, they're approaching or past their expected lifespan.`;
    return `${area.name}'s master-planned homes from the 1990s-2000s use CPVC and copper plumbing that's generally reliable but beginning to show age-related wear, especially in ${area.county} County's ${area.waterHardness} water conditions.`;
  }
  // 2010s-present
  if (slug.includes('tankless') || slug.includes('water-heater')) return `Newer homes in ${area.name} are ideal candidates for tankless water heater upgrades — the PEX plumbing already installed supports high-flow connections.`;
  return `${area.name}'s newer homes with PEX plumbing are generally trouble-free, but builder-grade fixtures and settling foundations in ${area.county} County's ${area.soilType} soil can create early maintenance needs.`;
}

function getWhyAreaNeedsService(area: SEOArea, service: SEOService): string {
  const factors: string[] = [];

  // Soil type impact
  if (area.soilType === 'expansive-clay' || area.soilType === 'clay') {
    factors.push(`${area.name}'s ${area.soilType} soil expands and contracts dramatically with Houston's wet-dry cycles, putting constant stress on underground pipes and foundations. This makes ${service.name.toLowerCase()} especially important for homes in ${area.zipCode}.`);
  } else if (area.soilType === 'sandy') {
    factors.push(`The sandy soil in ${area.name} drains quickly but can shift and erode around pipe connections, leading to misalignment over time that affects ${service.name.toLowerCase()} outcomes.`);
  }

  // Water hardness impact
  if (area.waterHardness === 'very-hard' || area.waterHardness === 'hard') {
    factors.push(`${area.county} County's ${area.waterHardness} water (typical in ${area.name}) accelerates mineral scale buildup inside pipes, water heaters, and fixtures. This means ${service.name.toLowerCase()} needs here often involve descaling or addressing calcium deposits that reduce system efficiency.`);
  }

  // Flood risk impact
  if (area.floodRisk === 'high') {
    factors.push(`${area.name} is in a high flood-risk zone, meaning plumbing systems here face periodic submersion stress, backflow risk, and accelerated corrosion from floodwater exposure. Post-flood ${service.name.toLowerCase()} inspection and repair is critical.`);
  } else if (area.floodRisk === 'moderate') {
    factors.push(`With moderate flood risk in ${area.name}, homeowners should ensure their plumbing includes backflow prevention and that any ${service.name.toLowerCase()} work accounts for potential water exposure during heavy rain events.`);
  }

  // Value tier impacts cost expectations
  if (area.valueTier === 'luxury' || area.valueTier === 'upscale') {
    factors.push(`As an ${area.valueTier} neighborhood, ${area.name} homeowners typically invest in premium fixtures and high-quality ${service.name.toLowerCase()} work that matches the caliber of their homes. Plumbers serving ${area.name} should be prepared for high-end fixture brands and custom installations.`);
  }

  return factors.join(' ');
}

function getCostFactors(area: SEOArea, service: SEOService): string {
  let costAdj = '';
  if (area.valueTier === 'luxury') costAdj = '10-20% above Houston average due to premium fixture expectations and larger home sizes';
  else if (area.valueTier === 'upscale') costAdj = '5-15% above Houston average reflecting higher fixture quality and home values';
  else if (area.valueTier === 'budget') costAdj = 'at or slightly below Houston average, with cost-effective repair options prioritized';
  else costAdj = 'close to the Houston metro average';

  let baseCost = `$${service.avgCostLow}-$${service.avgCostHigh}`;

  let eraAdj = '';
  if (area.avgHomeAge > 60) eraAdj = ` Older homes in ${area.name} (average ${area.avgHomeAge} years) may see additional costs for adapting modern materials to legacy ${area.commonPipeType} systems.`;
  else if (area.avgHomeAge > 40) eraAdj = ` Mid-age homes in ${area.name} (around ${area.avgHomeAge} years old) sometimes need supplemental work when ${area.commonPipeType} connections are involved.`;

  return `The typical cost for ${service.name.toLowerCase()} in the Houston area ranges from ${baseCost}. In ${area.name} (${area.zipCode}), expect pricing ${costAdj}.${eraAdj} Get free quotes from multiple licensed plumbers in our directory to compare rates specific to your ${area.name} home.`;
}

function getLocalConsiderations(area: SEOArea, service: SEOService): string {
  const points: string[] = [];

  // Typical issues for the area
  if (area.typicalIssues.length > 0) {
    points.push(`Common plumbing issues in ${area.name} include ${area.typicalIssues.slice(0, 3).join(', ')} — all of which can intersect with ${service.name.toLowerCase()} needs.`);
  }

  // Region-specific notes
  if (area.region === 'inner-loop') {
    points.push(`As an inner-loop Houston neighborhood, ${area.name} has some of the oldest infrastructure in the metro. City permits for ${service.name.toLowerCase()} may require additional inspections in this area.`);
  } else if (area.region === 'exurban') {
    points.push(`${area.name}'s location in the outer Houston metro means some homes use well water or septic systems, which affects ${service.name.toLowerCase()} requirements and plumber selection.`);
  }

  // Seasonal note from service
  if (service.seasonalNote) {
    points.push(service.seasonalNote);
  }

  return points.join(' ');
}

// --- Problem + Area Content Generators ---

function getProblemAreaIntro(area: SEOArea, problem: SEOProblem): string {
  return `If you're experiencing a ${problem.name.toLowerCase()} in your ${area.name} home, you're not alone — this is one of the most reported plumbing issues in the ${area.zipCode} area. ${area.name}'s ${area.housingStyle.toLowerCase()}, typically built in the ${area.housingEra} era with ${area.commonPipeType} plumbing, are ${getProblemSusceptibility(area, problem)} to this problem. ${problem.description}`;
}

function getProblemSusceptibility(area: SEOArea, problem: SEOProblem): string {
  const slug = problem.slug;

  if ((slug === 'slab-leak' || slug === 'burst-pipe') && (area.soilType === 'expansive-clay' || area.soilType === 'clay')) {
    return 'especially susceptible';
  }
  if ((slug === 'clogged-drain' || slug === 'root-intrusion') && area.avgHomeAge > 50) {
    return 'particularly vulnerable';
  }
  if (slug === 'sewage-backup' && area.floodRisk === 'high') {
    return 'at elevated risk';
  }
  if ((slug === 'leaking-faucet' || slug === 'water-discoloration') && area.waterHardness === 'very-hard') {
    return 'commonly affected';
  }
  if (slug === 'low-water-pressure' && area.commonPipeType.includes('galvanized')) {
    return 'frequently impacted';
  }
  return 'occasionally subject';
}

function getWhyAreaHasProblem(area: SEOArea, problem: SEOProblem): string {
  const factors: string[] = [];

  factors.push(`In ${area.name}, several local factors contribute to ${problem.name.toLowerCase()} occurrences:`);

  if (area.avgHomeAge > 50) {
    factors.push(`- **Aging plumbing infrastructure**: At ${area.avgHomeAge}+ years old, ${area.name}'s ${area.commonPipeType} pipes are past their expected lifespan, making them more prone to this issue.`);
  }

  if (area.soilType === 'expansive-clay' && (problem.slug.includes('leak') || problem.slug.includes('burst') || problem.slug === 'slab-leak')) {
    factors.push(`- **Expansive clay soil**: ${area.name}'s soil expands up to 30% when wet and shrinks when dry, creating constant movement that stresses underground pipes and foundations.`);
  }

  if (area.waterHardness === 'hard' || area.waterHardness === 'very-hard') {
    factors.push(`- **${area.waterHardness === 'very-hard' ? 'Very hard' : 'Hard'} water**: ${area.county} County water in ${area.name} leaves mineral deposits that contribute to ${problem.name.toLowerCase()}-related wear on plumbing components.`);
  }

  if (area.floodRisk === 'high' && (problem.slug.includes('sewer') || problem.slug.includes('backup') || problem.slug === 'smelly-drains')) {
    factors.push(`- **High flood risk**: ${area.name}'s flood-prone location means sewer lines face periodic hydraulic surcharge from stormwater, increasing the risk of backups and related problems.`);
  }

  const typicalMatch = area.typicalIssues.find(issue =>
    problem.name.toLowerCase().split(' ').some(word => issue.toLowerCase().includes(word))
  );
  if (typicalMatch) {
    factors.push(`- **Known local pattern**: "${typicalMatch}" is already flagged as a common issue in ${area.name}, confirming this problem is prevalent in the area.`);
  }

  return factors.join('\n');
}

function getProblemLocalAdvice(area: SEOArea, problem: SEOProblem): string {
  let advice = `For ${area.name} residents dealing with ${problem.name.toLowerCase()}: `;

  if (problem.urgency === 'call-now') {
    advice += `This is an emergency — call a licensed plumber serving ${area.zipCode} immediately. `;
  } else if (problem.urgency === 'same-day') {
    advice += `We recommend same-day service to prevent the issue from worsening in ${area.name}'s ${area.soilType} soil and ${area.waterHardness} water conditions. `;
  } else {
    advice += `While not an emergency, scheduling a plumber visit this week prevents escalation, especially given ${area.name}'s ${area.commonPipeType} plumbing and ${area.avgHomeAge}-year-old infrastructure. `;
  }

  if (problem.healthRisk) {
    advice += `This issue poses a health risk — keep family members and pets away from affected areas until a professional from the ${area.zipCode} area can assess the situation. `;
  }

  if (problem.propertyDamageRisk === 'high') {
    advice += `Property damage risk is high. Document everything with photos for insurance purposes. Many ${area.valueTier}-tier ${area.name} homes carry flood and plumbing coverage that may apply.`;
  }

  return advice;
}

// --- Area Landing Content Generators ---

function getAreaOverview(area: SEOArea): string {
  return `${area.name} is a ${area.populationDesc} in ${area.county} County, located in Houston's ${area.region.replace('-', ' ')} area near ${area.nearbyLandmark}. The neighborhood is characterized by its ${area.housingStyle.toLowerCase()}, predominantly built during the ${area.housingEra} era. As a ${area.valueTier}-tier Houston neighborhood in the ${area.zipCode} zip code, ${area.name} has specific plumbing characteristics shaped by its ${area.avgHomeAge}-year-old homes and ${area.soilType} soil conditions.`;
}

function getAreaPlumbingChallenges(area: SEOArea): string {
  let content = `The most common plumbing challenges in ${area.name} stem from its unique combination of ${area.housingEra}-era ${area.commonPipeType} plumbing, ${area.soilType} soil, and ${area.waterHardness} water hardness. `;

  content += `Typical issues reported by ${area.name} homeowners include: ${area.typicalIssues.join('; ')}. `;

  if (area.floodRisk !== 'low') {
    content += `${area.name}'s ${area.floodRisk} flood risk adds another dimension — sewer backflow prevention and post-flood plumbing inspections are essential for homes in this area. `;
  }

  return content;
}

function getAreaHomeProfile(area: SEOArea): string {
  return `The typical ${area.name} home is approximately ${area.avgHomeAge} years old, featuring ${area.housingStyle.toLowerCase()} with ${area.commonPipeType} plumbing systems. ${area.county} County water in this area is classified as ${area.waterHardness}, which affects everything from water heater longevity to fixture lifespan. The ${area.soilType} soil beneath ${area.name} foundations ${area.soilType === 'expansive-clay' ? 'is Houston\'s most problematic for plumbing — expanding and contracting with moisture levels and putting constant stress on underground pipes' : area.soilType === 'clay' ? 'retains moisture and can shift during dry periods, creating moderate risk for underground pipe movement' : area.soilType === 'sandy' ? 'drains well but can erode and shift around pipe connections over time' : 'provides relatively stable conditions for underground plumbing'}.`;
}
