const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getCompanyNameFromRequest = (request) =>
  request.companyName || request.company || request.details?.companyName || '';

export const filterRequestsForCompanyUser = (requests, user) => {
  const withCompanyName = requests.filter((request) => normalizeText(getCompanyNameFromRequest(request)));

  const userKeys = [user.companyName, user.name, user.full_name, user.username, user.email]
    .map(normalizeText)
    .filter(Boolean);

  const matchedByName = withCompanyName.filter((request) => {
    const companyName = normalizeText(getCompanyNameFromRequest(request));
    return userKeys.some((key) => companyName === key || companyName.includes(key) || key.includes(companyName));
  });

  if (matchedByName.length > 0) {
    return matchedByName;
  }

  const fallbackKey = normalizeText(user.name || user.username || user.email);
  const isGenericCompanyAccount =
    fallbackKey === 'company' ||
    fallbackKey === 'company user' ||
    fallbackKey.includes('company') ||
    fallbackKey === 'บริษัท';

  if (isGenericCompanyAccount) {
    return withCompanyName.filter((request) =>
      ['รอสถานประกอบการตอบรับ', 'อนุมัติแล้ว', 'ปฏิเสธ', 'ออกฝึกงาน', 'ฝึกงานเสร็จแล้ว'].includes(request.status)
    );
  }

  return [];
};

export const getCompanyDisplayName = (user) => user.companyName || user.name || user.full_name || user.username || '';
