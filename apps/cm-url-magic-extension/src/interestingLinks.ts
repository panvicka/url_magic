import { LinkGroups, type Link } from "@cm-url-magic/utility";

export const interestingLinks: Link[] = [
    {
        group: LinkGroups.dev,
        name: 'Dev Prev',
        href: 'https://preview.ksb-dev.bitgrip.berlin/demo-de-de'
    },
    {
        group: LinkGroups.stage,
        name: 'Stage Prev',
        href: 'https://preview.ksb-stage.bitgrip.berlin/de-de'
    },
    {
        group: LinkGroups.stage,
        name: 'Stage Live',
        href: 'https://live.ksb-stage.bitgrip.berlin/de-de'
    },
    {
        group: LinkGroups.prod,
        name: 'Prod Prev',
        href: 'https://preview-e2e-sales.ksb.com/de-de'
    },
    {
        group: LinkGroups.dev,
        name: 'CM Dev',
        href: 'https://studio.ksb-dev.bitgrip.berlin'
    },
    {
        group: LinkGroups.stage,
        name: 'CM Stage',
        href: 'https://studio.ksb-stage.bitgrip.berlin'
    },
    {
        group: LinkGroups.prod,
        name: 'CM Prod',
        href: 'https://studio-e2e-sales.ksb.com'
    },
    {
        group: LinkGroups.prod,
        name: 'Prod Live',
        href: 'ksb.com/de-de'
    },
    {
        group: LinkGroups.mix,
        name: 'Localhost node-app',
        href: 'http://localhost:8081/demo-de-de/'
    },
    {
        group: LinkGroups.mix,
        name: 'Storybook',
        href: 'http://localhost:5010'
    },
    {
        group: LinkGroups.mix,
        name: 'AT Monitor',
        href: 'https://jenkins.infra.bitgrip.berlin/job/KSB/view/AT-Monitor/'
    }
];
