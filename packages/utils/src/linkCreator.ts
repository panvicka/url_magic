import {
  DEFAULT_LANG,
  DEFAULT_PROD_LANG,
  Environments,
  GroupedLinks,
  LinkGroups,
  userInfoType,
  type Link,
} from "./types";

const getLocalHostPath = ({
  language,
  path,
}: {
  language?: string;
  path: string;
}) => {
  return [
    {
      group: LinkGroups.mix,
      name: "Localhost",
      href: `http://localhost:8081/${language || DEFAULT_PROD_LANG}/${path}`,
    },
  ];
};

const getJiraTicketPath = ({ ticketNumber }: { ticketNumber?: string }) => {
  if (!ticketNumber) return [];
  return [
    {
      group: LinkGroups.mix,
      name: "Jira Ticket",
      href: `https://bitgrip.atlassian.net/browse/KSBP-${ticketNumber}`,
    },
  ];
};

const getProdPath = ({
  language,
  path,
}: {
  language?: string;
  path: string;
}) => {
  return [
    {
      group: LinkGroups.prod,
      name: "Prod Prev",
      href: `https://preview-e2e-sales.ksb.com/${language || DEFAULT_PROD_LANG}/${path}`,
    },
    {
      group: LinkGroups.prod,
      name: "CM Prod Prev",
      href: `https://preview-resources-e2e-sales.ksb.com/api/v1/page/${language}/${path}`,
    },
    {
      group: LinkGroups.prod,
      name: "Prod Live",
      href: `https://www.ksb.com/${language || DEFAULT_PROD_LANG}/${path}`,
    },
    {
      group: LinkGroups.prod,
      name: "CM Prod Live",
      href: `https://live-resources-e2e-sales.ksb.com/api/v1/page/${language}/${path}`,
    },
  ];
};

const getStagePath = ({
  language,
  path,
}: {
  language?: string;
  path: string;
}) => {
  const languageWithoutDemo = language?.replace("demo-", "");
  return [
    {
      group: LinkGroups.stage,
      name: "Stage Prev",
      href: `https://preview.ksb-stage.bitgrip.berlin/${language}/${path}`,
    },
    {
      group: LinkGroups.stage,
      name: "CM Stage Prev",
      href: `https://preview-api.ksb-stage.bitgrip.berlin/api/v1/page/${language}/${path}`,
    },
    {
      group: LinkGroups.stage,
      name: "Stage Live",
      href: `https://live.ksb-stage.bitgrip.berlin/${languageWithoutDemo}/${path}`,
    },
    {
      group: LinkGroups.stage,
      name: "CM Stage Live",
      href: `https://stage.ksb.com/api/v1/page/${languageWithoutDemo}/${path}`,
    },
  ];
};

const getDevPath = ({
  language,
  path,
}: {
  language?: string;
  path: string;
}) => {
  return [
    {
      group: LinkGroups.dev,
      name: "Dev Prev",
      href: `https://preview.ksb-dev.bitgrip.berlin/${language || DEFAULT_LANG}/${path}`,
    },
    {
      group: LinkGroups.dev,
      name: "CM Dev Prev",
      href: `https://preview-api.ksb-dev.bitgrip.berlin/api/v1/page/${language || DEFAULT_LANG}/${path}`,
    },
  ];
};

const getPlaywrightPath = ({ ticketNumber }: { ticketNumber?: string }) => {
  return [
    {
      group: LinkGroups.mix,
      name: "Playwright Gitlab Page",
      href: `https://ksb.pages.oo.bitgrip.berlin/ksb-website/playwright-ksbp-${ticketNumber}`,
    },
  ];
};

const getBranchDeploymentPaths = ({
  ticketNumber,
  language,
  path,
}: {
  ticketNumber?: string;
  language?: string;
  path?: string;
}) => {
  const links: Link[] = [];
  if (!ticketNumber) return links;
  return [
    {
      name: "Branch",
      href: `https://ksbp-${ticketNumber}.ksb-dev.bitgrip.berlin/${language || DEFAULT_LANG}/${path}`,
      group: LinkGroups.branch,
    },
  ];
};
export const linkCreator = (userInfo: userInfoType) => {
  const {
    language = DEFAULT_LANG,
    path = "",
    ticketNumber,
    optionalTicketNumber,
    environment,
  } = userInfo;
  let links: Link[] = [];

  if (ticketNumber || optionalTicketNumber) {
    let useTicketNumber = ticketNumber || optionalTicketNumber;
    if (ticketNumber && optionalTicketNumber) {
      useTicketNumber = optionalTicketNumber;
    }

    links = [
      ...links,
      ...getBranchDeploymentPaths({
        ticketNumber: useTicketNumber,
        language: language,
        path,
      }),
    ];

    links = [
      ...links,
      ...getJiraTicketPath({
        ticketNumber: ticketNumber || optionalTicketNumber,
      }),
      ...getPlaywrightPath({
        ticketNumber: useTicketNumber,
      }),
    ];
  }

  if (
    environment?.name === Environments.PROD ||
    environment?.name === Environments.PROD_PREVIEW
  ) {
    links = [
      ...links,
      ...getProdPath({ language, path }),
      ...getStagePath({ language, path }),
      ...getDevPath({ language, path }),
      ...getLocalHostPath({ language, path }),
    ];
  }

  if (environment?.name === Environments.DEV_PREVIEW) {
    links = [
      ...links,
      ...getStagePath({ language, path }),
      ...getDevPath({ language, path }),
      ...getLocalHostPath({ language, path }),
    ];
  }

  if (
    environment?.name === Environments.STAGE_PREVIEW ||
    environment?.name === Environments.STAGE
  ) {
    links = [
      ...links,
      ...getProdPath({ language, path }),
      ...getStagePath({ language, path }),
      ...getDevPath({ language, path }),
      ...getLocalHostPath({ language, path }),
    ];
  }

  if (environment?.name === Environments.LOCALHOST) {
    links = [
      ...links,
      ...getDevPath({ language, path }),
      ...getProdPath({ language, path }),
      ...getStagePath({ language, path }),
    ];
  }

  return links;
};

export const groupAndSortLinks = (links: Link[]) => {
  let groupedData = links.reduce((acc, item) => {
    const groupName = item.group;
    if (groupName) {
      if (!acc[groupName]) {
        acc[groupName] = {
          group: groupName,
          links: [],
        };
      }
      acc[groupName].links.push({ name: item.name, href: item.href });
    }
    return acc;
  }, {} as GroupedLinks);

  groupedData = Object.keys(groupedData)
    .sort()
    .reduce((acc: GroupedLinks, key) => {
      acc[key] = groupedData[key];
      return acc;
    }, {} as GroupedLinks);

  return groupedData;
};
