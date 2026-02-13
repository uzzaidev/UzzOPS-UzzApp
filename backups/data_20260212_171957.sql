--
-- PostgreSQL database dump
--

\restrict F76jGOAudcTjOCruOdkCbSOqYH0J4dthElwTddaJmrOGqQKG6qNz1DqI8EonsXt

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
64565ab3-4e4d-4e50-bdae-4a46ab2f22e7	2c020a30-f4e2-40eb-9940-56cbddb5253d	221635ad-fba7-4ec4-a9fd-5f8ff78634f2	s256	u0JB45MBjcrEjTrUABBrqOPhh27TnO1qvxXwpN7L4rk	email			2026-02-12 14:50:28.924804+00	2026-02-12 14:50:28.924804+00	email/signup	\N	\N	\N	\N	\N	f
61fa6517-8c2a-4d7c-960f-b21a4ae57452	2c020a30-f4e2-40eb-9940-56cbddb5253d	5745ad69-8364-4db9-85df-ce5b3ba39c70	s256	f6JzoErLnr0NhTGM9pSUTGP1PTPv37zw4TgcOpRYTiA	email			2026-02-12 14:52:45.316645+00	2026-02-12 14:54:47.391601+00	email/signup	2026-02-12 14:54:47.391545+00	\N	\N	\N	\N	f
29abbf22-7815-4f41-bc0c-dad475816efa	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	c72cff5c-1ea3-4ed5-83e9-943111c44203	s256	XCbOUqHoYqMQVp7vUWRkIMWgIuUNB02Pz5n9Et-o180	email			2026-02-12 15:14:58.843717+00	2026-02-12 15:15:45.264948+00	email/signup	2026-02-12 15:15:45.2649+00	\N	\N	\N	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	authenticated	authenticated	contato@uzzai.com.br	$2a$10$CcMckJkaiATUX.dn7hNwEuB8WTOKtuhqoFpUJVZQGuyDAu/1VL6wm	2026-02-12 15:15:45.259977+00	\N		2026-02-12 15:14:58.844806+00		\N			\N	2026-02-12 16:03:06.303149+00	{"provider": "email", "providers": ["email"]}	{"sub": "ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0", "email": "contato@uzzai.com.br", "full_name": "UzzaiTeste", "email_verified": true, "phone_verified": false}	\N	2026-02-12 15:14:58.832973+00	2026-02-12 18:53:29.923869+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b71dacbe-881f-4eca-af17-01d5b2cf108c	authenticated	authenticated	pedro.pagliarin@uzzai.com.br	$2a$10$SjEO9JXHNia/q1zDyLOKm.H77kEq0n.tqnXeSxd8MJqBAvouskUl6	2026-02-06 20:21:42.809862+00	\N		\N		\N			\N	2026-02-12 18:12:29.889598+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-02-06 20:21:42.798674+00	2026-02-12 19:11:22.746337+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
b71dacbe-881f-4eca-af17-01d5b2cf108c	b71dacbe-881f-4eca-af17-01d5b2cf108c	{"sub": "b71dacbe-881f-4eca-af17-01d5b2cf108c", "email": "pedro.pagliarin@uzzai.com.br", "email_verified": false, "phone_verified": false}	email	2026-02-06 20:21:42.807518+00	2026-02-06 20:21:42.807585+00	2026-02-06 20:21:42.807585+00	f9552b9f-3991-46e5-8d45-cbe3e13083c4
ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	{"sub": "ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0", "email": "contato@uzzai.com.br", "full_name": "UzzaiTeste", "email_verified": true, "phone_verified": false}	email	2026-02-12 15:14:58.840688+00	2026-02-12 15:14:58.84074+00	2026-02-12 15:14:58.84074+00	d548b6d7-82d2-4c77-87f9-e15768d19eab
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
d054601e-0bce-4370-9380-bcc2faf4f339	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	2026-02-12 16:03:06.303237+00	2026-02-12 18:53:29.925517+00	\N	aal1	\N	2026-02-12 18:53:29.925427	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	189.6.214.125	\N	\N	\N	\N	\N
190adbed-5393-4a68-a588-f6b9947cbb85	b71dacbe-881f-4eca-af17-01d5b2cf108c	2026-02-12 18:12:29.889688+00	2026-02-12 19:11:23.903397+00	\N	aal1	\N	2026-02-12 19:11:23.903303	node	189.6.214.125	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
d054601e-0bce-4370-9380-bcc2faf4f339	2026-02-12 16:03:06.306421+00	2026-02-12 16:03:06.306421+00	password	c4485f2c-2c6f-485a-a492-39bc74202b69
190adbed-5393-4a68-a588-f6b9947cbb85	2026-02-12 18:12:29.8932+00	2026-02-12 18:12:29.8932+00	password	1829ad3a-dcec-4bdc-858e-d5efa262222d
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	63	efxjxoda6o6l	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	t	2026-02-12 16:03:06.304634+00	2026-02-12 17:36:37.724338+00	\N	d054601e-0bce-4370-9380-bcc2faf4f339
00000000-0000-0000-0000-000000000000	64	2sasqpjq2gbg	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	t	2026-02-12 17:36:37.725478+00	2026-02-12 18:53:29.92157+00	efxjxoda6o6l	d054601e-0bce-4370-9380-bcc2faf4f339
00000000-0000-0000-0000-000000000000	68	jqm4hiv43zbg	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	f	2026-02-12 18:53:29.922449+00	2026-02-12 18:53:29.922449+00	2sasqpjq2gbg	d054601e-0bce-4370-9380-bcc2faf4f339
00000000-0000-0000-0000-000000000000	67	hkdpacvvcmva	b71dacbe-881f-4eca-af17-01d5b2cf108c	t	2026-02-12 18:12:29.891301+00	2026-02-12 19:11:22.744322+00	\N	190adbed-5393-4a68-a588-f6b9947cbb85
00000000-0000-0000-0000-000000000000	69	q72of4qbwxvg	b71dacbe-881f-4eca-af17-01d5b2cf108c	f	2026-02-12 19:11:22.745052+00	2026-02-12 19:11:22.745052+00	hkdpacvvcmva	190adbed-5393-4a68-a588-f6b9947cbb85
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, slug, name, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	uzzai	UzzAI	2026-02-06 20:20:06.95706+00	2026-02-06 20:20:06.95706+00
3a9a82df-7c26-40a5-a67c-62f57fc192cf	tenant-b	Tenant B	2026-02-12 15:37:41.218893+00	2026-02-12 15:37:41.218893+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, tenant_id, code, name, description, status, progress, budget, budget_spent, start_date, end_date, created_at, updated_at) FROM stdin;
2469c4d1-50dc-4d95-aea4-18767825d620	00000000-0000-0000-0000-000000000001	UZZAPP	UzzApp - Chatbot WhatsApp com IA	Sistema de chatbot com IA integrada para WhatsApp Business. Oferece atendimento automatizado 24/7, RAG para busca em documentação, multi-tenant (múltiplas empresas), integração com WhatsApp Business API, catálogo de produtos e fluxos conversacionais customizáveis.	active	0	\N	0.00	2026-02-10	\N	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
9cd8173d-992a-45d7-9401-0a56b591d9a2	00000000-0000-0000-0000-000000000001	PROJ-B-TESTE	projeto B	TEste	active	0	\N	0.00	\N	\N	2026-02-12 15:28:48.946527+00	2026-02-12 15:28:48.946527+00
8db74050-e41d-4aba-8807-afe1458f8f4f	00000000-0000-0000-0000-000000000001	TESTE-C	PROJETO C	TESTCE	active	0	\N	0.00	\N	\N	2026-02-12 15:31:43.308211+00	2026-02-12 15:31:43.308211+00
9214319b-a334-406a-99f5-517941b7f9ef	3a9a82df-7c26-40a5-a67c-62f57fc192cf	PRJ-B	Projeto B	Projeto tenant B	active	0	\N	0.00	\N	\N	2026-02-12 15:41:32.76578+00	2026-02-12 15:41:32.76578+00
\.


--
-- Data for Name: baseline_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.baseline_metrics (id, tenant_id, project_id, metric_name, metric_category, baseline_value, target_value, current_value, unit, baseline_date, target_date, last_measured_date, description, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: uzzapp_clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uzzapp_clients (id, tenant_id, name, company, phone, email, plan, status, onboarded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_catalogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_catalogs (id, tenant_id, client_id, product_name, product_description, price, sku, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_members (id, user_id, tenant_id, role, status, invited_by, joined_at, created_at, updated_at) FROM stdin;
49691343-1bb0-47c8-902b-ad66e1056fd1	b71dacbe-881f-4eca-af17-01d5b2cf108c	00000000-0000-0000-0000-000000000001	admin	active	\N	2026-02-12 11:45:43.9897+00	2026-02-12 11:45:43.9897+00	2026-02-12 15:41:18.942866+00
56678891-817d-4277-ad60-8ffd6a8e10bd	b71dacbe-881f-4eca-af17-01d5b2cf108c	3a9a82df-7c26-40a5-a67c-62f57fc192cf	admin	active	\N	2026-02-12 15:50:17.213913+00	2026-02-12 15:50:17.213913+00	2026-02-12 15:50:17.213913+00
2b387e99-1339-4ca9-9205-20798feeeef1	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	00000000-0000-0000-0000-000000000001	member	active	\N	2026-02-12 15:15:36.91+00	2026-02-12 15:14:58.832604+00	2026-02-12 16:04:11.36323+00
7444b1aa-8156-4bb1-9c50-40a23962d73b	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	3a9a82df-7c26-40a5-a67c-62f57fc192cf	member	active	\N	2026-02-12 15:41:24.798446+00	2026-02-12 15:41:24.798446+00	2026-02-12 16:04:11.36323+00
\.


--
-- Data for Name: sprints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sprints (id, tenant_id, project_id, code, name, goal, start_date, end_date, status, capacity_total, velocity_target, velocity_actual, created_at, updated_at, sprint_goal, duration_weeks, is_protected, started_at, completed_at) FROM stdin;
1fe1e352-1ce6-4f0b-84f1-14ea67860ced	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	SPRINT-0	Sprint 0 - Setup & Infraestrutura	Infraestrutura pronta para desenvolvimento do MVP	2026-02-10	2026-02-14	completed	5	0	\N	2026-02-06 20:20:15.211193+00	2026-02-06 23:22:56.329727+00	Sprint Goal - Atualizar objetivo	2	f	\N	\N
1e78bffb-c929-4e28-8ea4-c7bbd1bce2df	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	SP001	Testessss	Teste	2026-02-11	2026-02-19	planned	\N	\N	0	2026-02-06 23:00:50.858705+00	2026-02-06 23:22:56.329727+00	Sprint Goal - Atualizar objetivo	2	f	\N	\N
7b6ab436-6c2a-47f6-a5ef-3e2aef247d4d	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	SP0111	tESTE	\N	2026-02-06	2026-02-10	planned	\N	\N	0	2026-02-06 23:26:45.444038+00	2026-02-06 23:26:45.444038+00	Conseguir fazer 	2	f	\N	\N
7c98a7c5-2ea3-478d-96ae-a521f7c65f87	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	SPRINT-1	Sprint 1 - Fundamentos	Dashboard com KPIs reais + CRUD completo de Features funcionando OIOI	2026-02-17	2026-02-28	active	10	15	\N	2026-02-06 20:20:15.211193+00	2026-02-06 23:32:48.140952+00	Sprint Goal - Atualizar objetivo fdafa	2	t	2026-02-06 23:32:48.551	\N
65216ddc-b42b-4cc1-a2ef-f700444a65b6	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	SP001231	TESTAASDASFA	\N	2026-02-11	2026-02-20	completed	\N	\N	0	2026-02-12 14:26:42.87013+00	2026-02-12 14:26:42.87013+00	TESTASDASF	2	f	\N	\N
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, tenant_id, name, email, avatar_url, role, department, allocation_percent, velocity_avg, is_active, created_at, updated_at, user_id, permission_level, status) FROM stdin;
29db1301-446a-4c8b-b6a7-972f222a426c	00000000-0000-0000-0000-000000000001	Luis Fernando	luis@uzzai.com	\N	Tech Lead Full-Stack	Dev	100	\N	t	2026-02-06 20:20:15.211193+00	2026-02-11 18:53:52.564251+00	\N	member	active
d4487d0d-5c54-468b-8b42-a6bafe7dc216	00000000-0000-0000-0000-000000000001	Arthur	arthur@uzzai.com	\N	Marketing Manager	Marketing	100	\N	t	2026-02-06 20:20:15.211193+00	2026-02-11 18:53:52.564251+00	\N	member	active
43753848-902e-4f1d-ad6b-8fe0a455aa25	00000000-0000-0000-0000-000000000001	Lucas	lucas@uzzai.com	\N	Legal Advisor	Legal	100	\N	t	2026-02-06 20:20:15.211193+00	2026-02-11 18:53:52.564251+00	\N	member	active
379e7772-9268-4e7e-aec0-bfc633a3b5cf	00000000-0000-0000-0000-000000000001	Pedro Vitor	pedro@uzzai.com	\N	Product Owner + Frontend + UX/UI	Dev	100	\N	t	2026-02-06 20:20:15.211193+00	2026-02-11 18:53:52.564251+00	\N	admin	active
98b8e891-55d3-454d-9f4c-de06496e754e	00000000-0000-0000-0000-000000000001	pedro.pagliarin	pedro.pagliarin@uzzai.com.br	\N	Membro	\N	100	\N	t	2026-02-12 14:49:36.21755+00	2026-02-12 14:49:36.21755+00	b71dacbe-881f-4eca-af17-01d5b2cf108c	admin	active
a22f7aeb-bea4-4357-9a1a-f81cc5a4f41a	00000000-0000-0000-0000-000000000001	UzzaiTeste	contato@uzzai.com.br	\N	Membro	\N	100	\N	t	2026-02-12 15:14:58.832604+00	2026-02-12 15:36:46.775379+00	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	member	active
50564b53-8426-44f8-91a8-63adaf2edb40	00000000-0000-0000-0000-000000000001	Vitor	vitor@uzzai.com	\N	QA Admin Test	Sales	100	\N	t	2026-02-06 20:20:15.211193+00	2026-02-12 16:01:05.487491+00	\N	member	active
\.


--
-- Data for Name: daily_scrum_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_scrum_logs (id, project_id, sprint_id, team_member_id, log_date, what_did_yesterday, what_will_do_today, impediments, created_at, updated_at) FROM stdin;
623ba3c6-3398-4ddc-9895-6c026389ffc3	2469c4d1-50dc-4d95-aea4-18767825d620	\N	29db1301-446a-4c8b-b6a7-972f222a426c	2026-02-11	comecei a implemeatnar nvoametne	terminei os pscrints q tinah em metne	{nenhum,"qse nenhuma"}	2026-02-11 18:55:10.807026+00	2026-02-11 18:55:11.051+00
d6e3bae8-fe19-436c-8b25-03601c75ca36	2469c4d1-50dc-4d95-aea4-18767825d620	\N	98b8e891-55d3-454d-9f4c-de06496e754e	2026-02-12	Testandoo	vamos ver se agr vai	{"nao sei poq im","mas vai"}	2026-02-12 14:49:49.965187+00	2026-02-12 14:49:50.999+00
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.features (id, tenant_id, project_id, code, name, description, category, version, status, priority, moscow, gut_g, gut_u, gut_t, dod_functional, dod_tests, dod_code_review, dod_documentation, dod_deployed, dod_user_acceptance, responsible, due_date, story_points, business_value, work_effort, created_at, updated_at, is_mvp, acceptance_criteria, invest_checklist, is_epic, decomposed_at, is_spike, spike_timebox_hours, spike_outcome, spike_converted_to_story_id, work_item_type, solution_notes, dod_custom_items) FROM stdin;
3e90235f-d53d-4c87-86cc-459baea2a95b	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	F-002	US-002: Gestão de Features (CRUD)	CRUD completo de features: lista, filtros, criação, edição, detalhes, busca.	gestao-projetos	MVP	todo	P0	Must	5	5	4	f	f	f	f	f	f	{Pedro,Luis}	2026-02-25	8	9	5	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	feature	\N	{}
6495f880-6ae5-44ee-ba64-c44d5166690d	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	F-008	US-008: Autenticação de Usuários	Sistema de login com Supabase Auth, middleware de proteção de rotas, página de login.	gestao-projetos	MVP	in_progress	P0	Must	5	5	5	t	t	f	f	f	f	{Luis,Pedro}	\N	3	10	3	2026-02-06 20:20:15.211193+00	2026-02-06 22:38:14.37711+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	feature	\N	{}
d16dbffd-8147-4b13-bdbd-98df21302b45	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	F-001	US-001: Dashboard Overview do Projeto	Dashboard mostrando KPIs principais: Status, Progresso, Features, Equipe, Tempo de Execução.	gestao-projetos	MVP	review	P0	Must	5	5	5	f	f	f	f	f	f	{Pedro,Luis}	2026-02-20	5	10	3	2026-02-06 20:20:15.211193+00	2026-02-06 22:39:03.536074+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	feature	\N	{}
0a15b6eb-c880-46b4-96c0-7749ce74085e	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	F0099	Testeadasdf	asdfasdfasdc	gestao-equipe	MVP	backlog	P2	\N	\N	\N	\N	f	f	f	f	f	f	\N	\N	\N	\N	\N	2026-02-11 13:59:57.6068+00	2026-02-11 13:59:57.6068+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	feature	\N	{}
bdf50a38-b20e-44a7-b0ef-b0dd66bbde05	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	F0992	UzzBIM		gestao-equipe	MVP	backlog	P2	\N	\N	\N	\N	f	f	f	f	f	f	\N	\N	\N	\N	\N	2026-02-12 14:23:16.777354+00	2026-02-12 14:23:16.777354+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	feature	\N	{}
fb03f16b-ef60-44f4-888b-71078fe9ad9f	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	B0011111	TESGAAFDA BUGF	BUGG	analytics	MVP	backlog	P2	\N	\N	\N	\N	f	f	f	f	f	f	\N	\N	\N	\N	\N	2026-02-12 18:47:10.721584+00	2026-02-12 18:47:10.721584+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	bug	\N	{}
06880ad7-f1fe-4fc3-8e3d-945b4e970890	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	B001	Tetsndo bug	BUG TESTE	gestao-equipe	MVP	backlog	P2	\N	\N	\N	\N	t	f	t	f	f	f	\N	\N	\N	\N	\N	2026-02-12 18:13:19.300618+00	2026-02-12 19:11:59.806998+00	f	\N	{"small": null, "testable": null, "valuable": null, "estimable": null, "negotiable": null, "independent": null}	f	\N	f	\N	\N	\N	bug	\N	{}
\.


--
-- Data for Name: daily_feature_mentions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_feature_mentions (daily_log_id, feature_id, mention_type, created_at) FROM stdin;
\.


--
-- Data for Name: dod_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dod_history (id, project_id, from_level, to_level, reason, changed_by, changed_at) FROM stdin;
\.


--
-- Data for Name: dod_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dod_levels (id, project_id, level, name, criteria, is_active, activated_at, created_at) FROM stdin;
8e71fac1-4065-47ea-963d-c4ad1b0f152b	2469c4d1-50dc-4d95-aea4-18767825d620	1	Iniciante	["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]	t	\N	2026-02-11 18:14:05.765824+00
c07b3bf2-aafc-4a0c-b830-55caff30505a	2469c4d1-50dc-4d95-aea4-18767825d620	2	Intermediário	["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]	f	\N	2026-02-11 18:14:05.765824+00
6515a6e2-46ab-4924-b4f5-a546fa81ded0	2469c4d1-50dc-4d95-aea4-18767825d620	3	Avançado	["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]	f	\N	2026-02-11 18:14:05.765824+00
5f52b370-deed-4daf-96b9-9aae41f1991f	9cd8173d-992a-45d7-9401-0a56b591d9a2	1	Iniciante	["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]	t	\N	2026-02-12 15:28:48.946527+00
c8d26018-afc4-416f-9e59-ff122fc6a2ed	9cd8173d-992a-45d7-9401-0a56b591d9a2	2	Intermediário	["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]	f	\N	2026-02-12 15:28:48.946527+00
63702397-08f1-4264-80fe-7b1419f0b668	9cd8173d-992a-45d7-9401-0a56b591d9a2	3	Avançado	["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]	f	\N	2026-02-12 15:28:48.946527+00
6c426f97-b35b-4e01-8835-471e55d9fda0	8db74050-e41d-4aba-8807-afe1458f8f4f	1	Iniciante	["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]	t	\N	2026-02-12 15:31:43.308211+00
721f3c89-73ba-46cd-ab21-3fa263eef747	8db74050-e41d-4aba-8807-afe1458f8f4f	2	Intermediário	["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]	f	\N	2026-02-12 15:31:43.308211+00
d708760a-016e-40a4-a229-50a8aa15dead	8db74050-e41d-4aba-8807-afe1458f8f4f	3	Avançado	["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]	f	\N	2026-02-12 15:31:43.308211+00
23a26af5-7390-4be0-917b-70c63557ff26	9214319b-a334-406a-99f5-517941b7f9ef	1	Iniciante	["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]	t	\N	2026-02-12 15:41:32.76578+00
338c402c-b80a-4cba-8f82-e940d17940c5	9214319b-a334-406a-99f5-517941b7f9ef	2	Intermediário	["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]	f	\N	2026-02-12 15:41:32.76578+00
72ce8c28-4d7e-4061-86c7-1a550ad775a2	9214319b-a334-406a-99f5-517941b7f9ef	3	Avançado	["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]	f	\N	2026-02-12 15:41:32.76578+00
\.


--
-- Data for Name: epic_decomposition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.epic_decomposition (id, epic_id, child_story_id, decomposition_strategy, created_at) FROM stdin;
\.


--
-- Data for Name: export_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.export_history (id, project_id, exported_by, export_format, export_sections, file_size_bytes, exported_at) FROM stdin;
\.


--
-- Data for Name: feature_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_attachments (id, tenant_id, feature_id, file_name, file_path, mime_type, file_size, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: feature_clusters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_clusters (id, project_id, name, description, color, position_x, position_y, is_collapsed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: feature_cluster_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_cluster_members (feature_id, cluster_id, position_x, position_y, created_at) FROM stdin;
\.


--
-- Data for Name: feature_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_dependencies (id, project_id, feature_id, depends_on_id, dependency_type, created_at) FROM stdin;
a70e07d1-b261-414c-9e8e-93037f7c0c0d	2469c4d1-50dc-4d95-aea4-18767825d620	6495f880-6ae5-44ee-ba64-c44d5166690d	0a15b6eb-c880-46b4-96c0-7749ce74085e	blocks	2026-02-11 18:14:42.263007+00
\.


--
-- Data for Name: planning_poker_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planning_poker_sessions (id, tenant_id, project_id, name, type, status, feature_ids, current_feature_index, facilitator_id, revealed, created_at, completed_at) FROM stdin;
1d84fa03-645f-4c91-a5dc-61c1df6254e1	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	Testando F999	business_value	active	{0a15b6eb-c880-46b4-96c0-7749ce74085e}	0	\N	t	2026-02-11 14:12:49.431706+00	\N
\.


--
-- Data for Name: planning_poker_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planning_poker_results (id, session_id, feature_id, final_value, consensus_level, votes_summary, discussion_notes, created_at) FROM stdin;
\.


--
-- Data for Name: planning_poker_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planning_poker_votes (id, session_id, feature_id, voter_name, vote_value, vote_numeric, created_at) FROM stdin;
18f6f49e-c172-439c-8b76-5c8ddce07fea	1d84fa03-645f-4c91-a5dc-61c1df6254e1	0a15b6eb-c880-46b4-96c0-7749ce74085e	PV	13	13	2026-02-11 14:13:05.732898+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, user_id, full_name, avatar_url, created_at, updated_at) FROM stdin;
041dad91-6d5b-4e4c-8792-5c5433d9ded6	b71dacbe-881f-4eca-af17-01d5b2cf108c	pedro.pagliarin	\N	2026-02-12 11:19:32.298202+00	2026-02-12 11:19:32.298202+00
9b9f293b-66f8-4d5b-97f6-79a333758f62	ee5b0ec3-675b-4e91-9ae2-d5e6c3f3d1f0	UzzaiTeste	\N	2026-02-12 15:14:58.832604+00	2026-02-12 15:14:58.832604+00
\.


--
-- Data for Name: retrospective_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retrospective_actions (id, tenant_id, sprint_id, project_id, category, action_text, status, owner_id, due_date, success_criteria, outcome, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risks (id, tenant_id, project_id, public_id, title, description, gut_g, gut_u, gut_t, severity_label, status, mitigation_plan, owner_id, created_at, updated_at) FROM stdin;
e00ca817-bcdf-4db7-adfa-7c793b536fae	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	R-001	Dependência do WhatsApp Business API	Mudanças na política ou API do WhatsApp podem impactar o produto	4	3	4	Alto	mitigated	Implementar camada de abstração para facilitar migração para outras plataformas de mensagens	29db1301-446a-4c8b-b6a7-972f222a426c	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
a84d885d-81ad-42c8-8e73-a6c408466ef6	00000000-0000-0000-0000-000000000001	2469c4d1-50dc-4d95-aea4-18767825d620	R-002341	TESTEASASD		3	3	2	\N	analyzing	TESTANDO	\N	2026-02-12 14:27:22.902713+00	2026-02-12 14:27:22.902713+00
\.


--
-- Data for Name: sprint_burndown_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sprint_burndown_snapshots (id, tenant_id, sprint_id, snapshot_date, points_total, points_done, points_remaining, features_total, features_done, features_remaining, created_at) FROM stdin;
17757543-9c53-438f-8715-87b0e6935398	00000000-0000-0000-0000-000000000001	7c98a7c5-2ea3-478d-96ae-a521f7c65f87	2026-02-11	16	0	16	3	0	3	2026-02-11 19:23:35.464661+00
\.


--
-- Data for Name: sprint_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sprint_features (id, sprint_id, feature_id, priority, added_at) FROM stdin;
f8da45b2-0d92-42a9-84ad-fc667a7e5585	7c98a7c5-2ea3-478d-96ae-a521f7c65f87	d16dbffd-8147-4b13-bdbd-98df21302b45	0	2026-02-07 11:23:32.163708
838631c0-bf9a-4f19-ae4d-b6be399ab2ea	7c98a7c5-2ea3-478d-96ae-a521f7c65f87	3e90235f-d53d-4c87-86cc-459baea2a95b	0	2026-02-07 11:23:32.163708
1aa25517-a564-4bf7-aa63-52765385dfbd	7c98a7c5-2ea3-478d-96ae-a521f7c65f87	6495f880-6ae5-44ee-ba64-c44d5166690d	0	2026-02-07 11:23:32.163708
54931f2d-17b3-47c4-b8ae-f1f8f0d5f0e1	1e78bffb-c929-4e28-8ea4-c7bbd1bce2df	6495f880-6ae5-44ee-ba64-c44d5166690d	0	2026-02-07 11:23:32.163708
6f0ff998-cd85-44c9-b439-2de2827b9c23	1fe1e352-1ce6-4f0b-84f1-14ea67860ced	6495f880-6ae5-44ee-ba64-c44d5166690d	0	2026-02-07 11:23:56.845537
\.


--
-- Data for Name: sprint_scope_changes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sprint_scope_changes (id, sprint_id, feature_id, action, reason, changed_at, tenant_id) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, tenant_id, feature_id, title, description, status, assigned_to, estimated_hours, created_at, updated_at) FROM stdin;
24202130-4e3e-4ae5-ad89-0642b86f8186	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	Criar API /api/projects/:id/overview	\N	todo	Luis	8.00	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
1d14e2c8-d5fe-497e-9d23-c921b2340009	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	Componente DashboardCard	\N	todo	Pedro	4.00	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
d42b527b-83a2-40ca-8eaf-772259a6643a	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	Componente ProgressBar	\N	todo	Pedro	4.00	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
943ddafe-2e72-465d-ba50-0a6597d513fa	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	Integrar API com componentes	\N	todo	Pedro	4.00	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
44228696-a6b9-41bb-be95-08968b9b1c09	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	Testes E2E do dashboard	\N	todo	Pedro	4.00	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
\.


--
-- Data for Name: user_stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_stories (id, tenant_id, feature_id, public_id, as_a, i_want, so_that, acceptance_criteria, created_at, updated_at) FROM stdin;
14c9d530-b837-4f17-ab6a-396b21544b1a	00000000-0000-0000-0000-000000000001	d16dbffd-8147-4b13-bdbd-98df21302b45	US-001	Product Owner (Pedro)	visualizar um dashboard com KPIs principais do projeto UzzApp	eu possa ter uma visão rápida do status geral em um só lugar	["Dashboard mostra 4 cards de KPIs: Status, Progresso, Features, Equipe", "Seção Tempo de Execução com barra de progresso visual", "Dashboard responsivo (mobile, tablet, desktop)", "Carrega em menos de 2 segundos"]	2026-02-06 20:20:15.211193+00	2026-02-06 20:20:15.211193+00
\.


--
-- Data for Name: velocity_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.velocity_history (id, tenant_id, sprint_id, story_points_planned, story_points_completed, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-02-06 20:17:34
20211116045059	2026-02-06 20:17:35
20211116050929	2026-02-06 20:17:35
20211116051442	2026-02-06 20:17:35
20211116212300	2026-02-06 20:17:35
20211116213355	2026-02-06 20:17:35
20211116213934	2026-02-06 20:17:36
20211116214523	2026-02-06 20:17:36
20211122062447	2026-02-06 20:17:36
20211124070109	2026-02-06 20:17:36
20211202204204	2026-02-06 20:17:36
20211202204605	2026-02-06 20:17:37
20211210212804	2026-02-06 20:17:37
20211228014915	2026-02-06 20:17:38
20220107221237	2026-02-06 20:17:38
20220228202821	2026-02-06 20:17:38
20220312004840	2026-02-06 20:17:38
20220603231003	2026-02-06 20:17:39
20220603232444	2026-02-06 20:17:39
20220615214548	2026-02-06 20:17:39
20220712093339	2026-02-06 20:17:39
20220908172859	2026-02-06 20:17:39
20220916233421	2026-02-06 20:17:40
20230119133233	2026-02-06 20:17:40
20230128025114	2026-02-06 20:17:40
20230128025212	2026-02-06 20:17:40
20230227211149	2026-02-06 20:17:40
20230228184745	2026-02-06 20:17:41
20230308225145	2026-02-06 20:17:41
20230328144023	2026-02-06 20:17:41
20231018144023	2026-02-06 20:17:41
20231204144023	2026-02-06 20:17:41
20231204144024	2026-02-06 20:17:42
20231204144025	2026-02-06 20:17:42
20240108234812	2026-02-06 20:17:42
20240109165339	2026-02-06 20:17:42
20240227174441	2026-02-06 20:17:43
20240311171622	2026-02-06 20:17:43
20240321100241	2026-02-06 20:17:43
20240401105812	2026-02-06 20:17:44
20240418121054	2026-02-06 20:17:44
20240523004032	2026-02-06 20:17:45
20240618124746	2026-02-06 20:17:45
20240801235015	2026-02-06 20:17:45
20240805133720	2026-02-06 20:17:45
20240827160934	2026-02-06 20:17:46
20240919163303	2026-02-06 20:17:46
20240919163305	2026-02-06 20:17:46
20241019105805	2026-02-06 20:17:46
20241030150047	2026-02-06 20:17:47
20241108114728	2026-02-06 20:17:47
20241121104152	2026-02-06 20:17:47
20241130184212	2026-02-06 20:17:48
20241220035512	2026-02-06 20:17:48
20241220123912	2026-02-06 20:17:48
20241224161212	2026-02-06 20:17:48
20250107150512	2026-02-06 20:17:48
20250110162412	2026-02-06 20:17:49
20250123174212	2026-02-06 20:17:49
20250128220012	2026-02-06 20:17:49
20250506224012	2026-02-06 20:17:49
20250523164012	2026-02-06 20:17:49
20250714121412	2026-02-06 20:17:50
20250905041441	2026-02-06 20:17:50
20251103001201	2026-02-06 20:17:50
20251120212548	2026-02-06 20:17:50
20251120215549	2026-02-06 20:17:50
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
feature-assets	feature-assets	\N	2026-02-12 18:00:16.358244+00	2026-02-12 18:00:16.358244+00	f	f	10485760	{text/plain,text/markdown,application/pdf}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-02-06 20:17:39.266302
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-02-06 20:17:39.272799
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-02-06 20:17:39.292657
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-02-06 20:17:39.299661
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-02-06 20:17:39.303185
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-02-06 20:17:39.310528
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-02-06 20:17:39.313586
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-02-06 20:17:39.323558
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-02-06 20:17:39.327094
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-02-06 20:17:39.330619
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-02-06 20:17:39.333947
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-02-06 20:17:39.355346
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-02-06 20:17:39.358715
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-02-06 20:17:39.361906
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-02-06 20:17:39.367571
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-02-06 20:17:39.373223
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-02-06 20:17:39.376839
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-02-06 20:17:39.383277
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-02-06 20:17:39.393776
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-02-06 20:17:39.401811
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-02-06 20:17:39.405155
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-02-06 20:17:39.407952
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-02-06 20:17:39.52779
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-02-06 20:17:39.560042
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-02-06 20:17:39.563326
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-02-06 20:17:39.573391
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-02-06 20:17:39.577023
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-02-06 20:17:39.597113
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-02-06 20:17:39.277457
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-02-06 20:17:39.30686
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-02-06 20:17:39.31689
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-02-06 20:17:39.320187
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-02-06 20:17:39.411121
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-02-06 20:17:39.420731
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-02-06 20:17:39.481113
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-02-06 20:17:39.487811
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-02-06 20:17:39.493168
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-02-06 20:17:39.498274
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-02-06 20:17:39.50347
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-02-06 20:17:39.508485
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-02-06 20:17:39.50991
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-02-06 20:17:39.515634
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-02-06 20:17:39.518937
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-02-06 20:17:39.531295
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-02-06 20:17:39.538717
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-02-06 20:17:39.54228
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-02-06 20:17:39.548207
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-02-06 20:17:39.552056
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-02-06 20:17:39.556727
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-02-06 20:17:39.582269
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-11 13:44:29.570494
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-11 13:44:29.605576
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-11 13:44:29.607672
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-11 13:44:29.626789
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-11 13:44:29.630012
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-11 13:44:29.63206
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-11 13:44:29.641025
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 69, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict F76jGOAudcTjOCruOdkCbSOqYH0J4dthElwTddaJmrOGqQKG6qNz1DqI8EonsXt

