const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const nodeDetails = {
  internet: { kicker: 'Edge', title: 'Internet / WAN', body: 'The public edge feeds the firewall and routing layer. The portfolio intentionally omits addressing, provider details, and internal routes.', bullets: ['Public-facing exposure is minimized', 'Remote access is separated from general WAN exposure', 'Changes are validated from both inside and outside the environment'] },
  remote: { kicker: 'Remote Access', title: 'Tailscale + Cloudflare', body: 'Secure remote access is built around overlay networking and proxied application access instead of directly exposing management services.', bullets: ['Tailscale for private device-to-device access', 'Cloudflare for selected application publishing', 'No public management-plane details disclosed here'] },
  firewall: { kicker: 'Network Control Plane', title: 'pfSense', body: 'pfSense provides routing and policy enforcement between network zones, with IDS/IPS visibility and layered DNS controls.', bullets: ['VLAN and zone policy boundaries', 'Suricata IDS/IPS monitoring', 'pfBlockerNG and DNS filtering controls'] },
  lan: { kicker: 'Network Zone', title: 'Trusted LAN', body: 'Primary trusted-user and administration devices live in a more permissive zone while still relying on explicit policy and monitored infrastructure.', bullets: ['Management access is intentionally limited', 'Service dependencies are monitored', 'No internal addressing is published'] },
  iot: { kicker: 'Network Zone', title: 'IoT', body: 'Smart-home and appliance devices are isolated from trusted systems and receive narrower DNS and egress policy.', bullets: ['Restricted cross-zone access', 'DNS enforcement and filtering', 'mDNS is handled deliberately where discovery is required'] },
  dmz: { kicker: 'Network Zone', title: 'DMZ / Service Zone', body: 'Selected self-hosted services are separated from trusted endpoints and exposed only through controlled paths.', bullets: ['Service-first segmentation', 'Reverse-proxy and tunnel patterns', 'Independent health monitoring'] },
  guest: { kicker: 'Network Zone', title: 'Guest', body: 'Guest access is isolated from trusted and service networks with a simple internet-first policy.', bullets: ['No administrative access', 'No broad lateral visibility', 'Separate DNS and policy controls'] },
  proxmox: { kicker: 'Virtualization', title: 'Proxmox Platform', body: 'The virtualization layer hosts infrastructure services using a mix of VMs and containers while keeping network functions, DNS, management, and applications logically separated.', bullets: ['VM and LXC workloads', 'Linux administration and lifecycle management', 'Change validation before and after maintenance'] },
  homeassistant: { kicker: 'Automation', title: 'Home Assistant', body: 'Home Assistant is used as an automation and integration layer while infrastructure monitoring remains separate from convenience automations.', bullets: ['Container-based deployment', 'Camera and device integrations', 'Infrastructure-aware notifications'] },
  frigate: { kicker: 'Video / NVR', title: 'Frigate', body: 'Frigate provides camera processing and event workflows. Storage was migrated to a dedicated disk and validated at the filesystem, Docker namespace, and application layers.', bullets: ['Dedicated media storage', 'Health-checked container', 'Conservative duplicate cleanup with unique media preserved'] },
  jellyfin: { kicker: 'Media', title: 'Jellyfin', body: 'Jellyfin provides self-hosted media and live-TV workloads across multiple Linux systems, with hardware-accelerated transcode testing and operational monitoring.', bullets: ['Hardware acceleration validation', 'Live TV and guide workflows', 'Multi-host service checks'] },
  teslamate: { kicker: 'Telemetry', title: 'TeslaMate', body: 'TeslaMate stores vehicle telemetry in PostgreSQL and is operated with backup-first database maintenance and application-level validation.', bullets: ['PostgreSQL-backed telemetry', 'Grafana visualization', 'Verified logical backups before database mutation'] },
  uptime: { kicker: 'Monitoring', title: 'Uptime Kuma', body: 'Multiple monitoring nodes provide independent service availability checks and notification coverage.', bullets: ['Distributed monitoring', 'Service and endpoint checks', 'Notification paths verified independently'] },
  dns: { kicker: 'DNS', title: 'Technitium DNS', body: 'Primary and secondary DNS services provide internal resolution and filtering while selected network zones receive stricter enforcement.', bullets: ['Primary / secondary service pattern', 'Controlled fallback behavior', 'Policy-driven filtering by network zone'] }
};

const techDetails = {
  proxmox: ['Proxmox', 'Virtualization platform for network, DNS, management, and service workloads.', ['VMs', 'LXC', 'Linux', 'Network bridges']],
  pfsense: ['pfSense', 'Routing and policy layer for segmented networks with IDS/IPS visibility and filtering controls.', ['VLANs', 'Suricata', 'pfBlockerNG', 'Policy']],
  docker: ['Docker', 'Application packaging and service deployment across multiple Linux hosts with health checks where supported.', ['Compose', 'Health checks', 'Portainer', 'Self-hosting']],
  linux: ['Linux', 'Daily operating environment for administration, automation, troubleshooting, and service hosting.', ['Debian', 'Ubuntu', 'SSH', 'systemd']],
  dns: ['Technitium DNS', 'Internal DNS architecture with primary/secondary service roles and zone-specific controls.', ['DNS', 'Filtering', 'Redundancy', 'Policy']],
  tailscale: ['Tailscale', 'Private overlay access for administration and remote device connectivity without publishing management ports.', ['WireGuard overlay', 'Tailnet', 'Remote admin', 'Private access']],
  cloudflare: ['Cloudflare', 'Selected application publishing and secure tunnel patterns for externally reachable services.', ['Tunnels', 'Access', 'Proxy', 'DNS']],
  homeassistant: ['Home Assistant', 'Automation and integration layer for devices, cameras, and infrastructure-aware workflows.', ['Automation', 'HACS', 'Cameras', 'Notifications']],
  frigate: ['Frigate', 'NVR and camera-processing service with dedicated storage, health checks, and Home Assistant integration.', ['NVR', 'RTSP', 'Storage', 'Detection']],
  jellyfin: ['Jellyfin', 'Self-hosted media and live-TV platform with hardware-accelerated playback testing and guide workflows.', ['VAAPI', 'Live TV', 'FFmpeg', 'EPG']],
  teslamate: ['TeslaMate', 'Self-hosted vehicle telemetry stack backed by PostgreSQL, Grafana, and MQTT.', ['PostgreSQL', 'Grafana', 'MQTT', 'Telemetry']],
  uptime: ['Uptime Kuma', 'Distributed availability monitoring with separate notification paths and service checks.', ['Monitoring', 'HTTP', 'TCP', 'Alerts']],
  git: ['Git & GitHub', 'Version-controlled runbooks, session journals, scripts, and change history for repeatable operations.', ['Git', 'Documentation', 'Change history', 'Automation']],
  postgres: ['PostgreSQL', 'Database operations with backup verification, readiness checks, index validation, and controlled maintenance.', ['pg_dump', 'pg_restore', 'REINDEX', 'Validation']]
};

const projectDetails = {
  frigate: {
    title: 'Frigate Storage Migration & Cleanup',
    kicker: 'Case study · storage & integrity',
    html: '<p><strong>Problem:</strong> Camera media needed to move away from constrained system storage without losing recordings or introducing an unverified mount.</p><h3>Approach</h3><ul><li>Validated the dedicated ext4 media disk and Frigate health.</li><li>Traced the live media path through Docker\'s mount namespace rather than assuming the host view was authoritative.</li><li>Compared legacy and live media by relative path and exact byte size.</li><li>Deleted only confirmed duplicates after explicit approval, preserving all unique recordings and clips.</li></ul><div class="result-box"><strong>Result:</strong> Live Frigate storage remained healthy on the dedicated disk, duplicate legacy media was removed conservatively, and unique pre-cutover media was retained.</div>'
  },
  teslamate: {
    title: 'TeslaMate PostgreSQL Repair',
    kicker: 'Case study · database maintenance',
    html: '<p><strong>Problem:</strong> PostgreSQL reported a collation-version mismatch after the underlying userspace collation library changed.</p><h3>Approach</h3><ul><li>Confirmed the mismatch and database readiness using read-only queries.</li><li>Created a fresh custom-format logical backup and verified it with <code>pg_restore -l</code>.</li><li>Stopped only the application writer, rebuilt database indexes, and refreshed the recorded collation version.</li><li>Validated index health, application HTTP response, PostgreSQL readiness, container state, and the wider homelab.</li></ul><div class="result-box"><strong>Result:</strong> Recorded and actual collation versions matched, all indexes were valid, TeslaMate returned HTTP 200, and the full infrastructure validation passed.</div>'
  },
  network: {
    title: 'Network Security Architecture',
    kicker: 'Case study · segmentation & control',
    html: '<p><strong>Problem:</strong> A homelab that mixes trusted systems, IoT devices, guests, self-hosted applications, and remote access needs explicit boundaries rather than a flat network.</p><h3>Approach</h3><ul><li>Segmented traffic by trust and service role.</li><li>Used pfSense as the routing and policy control point.</li><li>Added Suricata IDS/IPS visibility, DNS filtering, and controlled mDNS where discovery was necessary.</li><li>Kept remote management private while publishing only selected applications through controlled paths.</li></ul><div class="result-box"><strong>Result:</strong> The environment can evolve without making every service equally trusted or equally exposed.</div>'
  },
  operations: {
    title: 'Operational Validation Framework',
    kicker: 'Case study · automation & change control',
    html: '<p><strong>Problem:</strong> Infrastructure changes are difficult to trust when validation depends on memory or ad-hoc spot checks.</p><h3>Approach</h3><ul><li>Built a repeatable multi-service health-check workflow.</li><li>Use read-only discovery before mutation and explicit approval gates for risky operations.</li><li>Record session journals and change history in Git.</li><li>Run broad post-maintenance validation after significant changes.</li></ul><div class="result-box"><strong>Result:</strong> The latest documented production validation completed with all 169 checks passing and RC=0.</div>'
  }
};

const navToggle = $('.nav-toggle');
const navLinks = $('#nav-links');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('is-open', !open);
});
$$('.nav-links a').forEach(link => link.addEventListener('click', () => {
  navToggle?.setAttribute('aria-expanded', 'false');
  navLinks?.classList.remove('is-open');
}));

const themeToggle = $('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('portfolio-theme', next);
});

const detailPanel = $('#node-detail');
$$('[data-node]').forEach(button => button.addEventListener('click', () => {
  const item = nodeDetails[button.dataset.node];
  if (!item || !detailPanel) return;
  detailPanel.innerHTML = `<p class="detail-eyebrow">${item.kicker}</p><h3>${item.title}</h3><p>${item.body}</p><ul>${item.bullets.map(x => `<li>${x}</li>`).join('')}</ul>`;
}));

const skillDetail = $('#skill-detail');
$$('[data-tech]').forEach(button => button.addEventListener('click', () => {
  const item = techDetails[button.dataset.tech];
  if (!item || !skillDetail) return;
  $$('[data-tech]').forEach(x => x.classList.toggle('is-active', x === button));
  skillDetail.innerHTML = `<p class="detail-eyebrow">How I use it</p><h3>${item[0]}</h3><p>${item[1]}</p><div class="mini-tags">${item[2].map(x => `<span>${x}</span>`).join('')}</div>`;
}));

$$('.capability[data-skill]').forEach(link => link.addEventListener('click', () => {
  const map = { networking: 'pfsense', virtualization: 'proxmox', containers: 'docker', monitoring: 'uptime', automation: 'git', media: 'frigate' };
  setTimeout(() => document.querySelector(`[data-tech="${map[link.dataset.skill]}"]`)?.click(), 350);
}));

const modal = $('#detail-modal');
const modalKicker = $('#modal-kicker');
const modalTitle = $('#modal-title');
const modalContent = $('#modal-content');
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projectDetails[button.dataset.project];
  if (!project || !modal) return;
  modalKicker.textContent = project.kicker;
  modalTitle.textContent = project.title;
  modalContent.innerHTML = project.html;
  modal.showModal();
}));
$$('.modal-close').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) dialog.close();
}));

const lightbox = $('#lightbox');
const lightboxImage = $('#lightbox-image');
const lightboxCaption = $('#lightbox-caption');
$$('.gallery-item').forEach(button => button.addEventListener('click', () => {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = button.dataset.image;
  lightboxImage.alt = $('img', button)?.alt || '';
  lightboxCaption.textContent = button.dataset.caption;
  lightbox.showModal();
}));

const sections = $$('main section[id]');
const navAnchors = $$('.nav-links a');
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navAnchors.forEach(link => link.toggleAttribute('aria-current', link.getAttribute('href') === `#${visible.target.id}`));
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
sections.forEach(section => observer.observe(section));
