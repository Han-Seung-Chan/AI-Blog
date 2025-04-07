export function getRandomAgeGroup(): string {
  const ageGroups = ["10s", "20s", "30s", "40s", "50s"];
  const randomIndex = Math.floor(Math.random() * ageGroups.length);
  return ageGroups[randomIndex];
}

export function getRandomGender(): string {
  return Math.random() > 0.5 ? "male" : "female";
}
