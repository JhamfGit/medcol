--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: actualizar_fecha_modificacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_fecha_modificacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Actualiza el campo fecha_modificacion con la fecha y hora actuales
    NEW.fecha_modificacion = current_timestamp;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_fecha_modificacion() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tb_documentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_documentos (
    id_documento integer NOT NULL,
    id_paciente integer,
    documento_tipo character varying(1000),
    fecha_registro timestamp without time zone,
    es_pendiente boolean,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer
);


ALTER TABLE public.tb_documentos OWNER TO postgres;

--
-- Name: tb_documentos_id_documento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_documentos_id_documento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_documentos_id_documento_seq OWNER TO postgres;

--
-- Name: tb_documentos_id_documento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_documentos_id_documento_seq OWNED BY public.tb_documentos.id_documento;


--
-- Name: tb_entregas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_entregas (
    id_entrega integer NOT NULL,
    id_paciente integer,
    fecha_entrega timestamp without time zone,
    observaciones character varying(1000),
    estado character(1),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer
);


ALTER TABLE public.tb_entregas OWNER TO postgres;

--
-- Name: tb_entregas_id_entrega_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_entregas_id_entrega_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_entregas_id_entrega_seq OWNER TO postgres;

--
-- Name: tb_entregas_id_entrega_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_entregas_id_entrega_seq OWNED BY public.tb_entregas.id_entrega;


--
-- Name: tb_pacientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_pacientes (
    id_paciente integer NOT NULL,
    msd integer,
    nombre character varying(255),
    id_tipo_documento integer,
    no_documento character varying(20),
    direccion character varying(255),
    eps character varying(255),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer
);


ALTER TABLE public.tb_pacientes OWNER TO postgres;

--
-- Name: tb_pacientes_id_paciente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_pacientes_id_paciente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_pacientes_id_paciente_seq OWNER TO postgres;

--
-- Name: tb_pacientes_id_paciente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_pacientes_id_paciente_seq OWNED BY public.tb_pacientes.id_paciente;


--
-- Name: tb_tipo_documento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_tipo_documento (
    id_tipo_documento integer NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.tb_tipo_documento OWNER TO postgres;

--
-- Name: tb_tipo_documento_id_tipo_documento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_tipo_documento_id_tipo_documento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_tipo_documento_id_tipo_documento_seq OWNER TO postgres;

--
-- Name: tb_tipo_documento_id_tipo_documento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_tipo_documento_id_tipo_documento_seq OWNED BY public.tb_tipo_documento.id_tipo_documento;


--
-- Name: tb_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_usuarios (
    id_usuario integer NOT NULL,
    usuario character varying(100),
    pass character varying(100),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tb_usuarios OWNER TO postgres;

--
-- Name: tb_usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: tb_usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_usuarios_id_usuario_seq OWNED BY public.tb_usuarios.id_usuario;


--
-- Name: tb_documentos id_documento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_documentos ALTER COLUMN id_documento SET DEFAULT nextval('public.tb_documentos_id_documento_seq'::regclass);


--
-- Name: tb_entregas id_entrega; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_entregas ALTER COLUMN id_entrega SET DEFAULT nextval('public.tb_entregas_id_entrega_seq'::regclass);


--
-- Name: tb_pacientes id_paciente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_pacientes ALTER COLUMN id_paciente SET DEFAULT nextval('public.tb_pacientes_id_paciente_seq'::regclass);


--
-- Name: tb_tipo_documento id_tipo_documento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_tipo_documento ALTER COLUMN id_tipo_documento SET DEFAULT nextval('public.tb_tipo_documento_id_tipo_documento_seq'::regclass);


--
-- Name: tb_usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.tb_usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: tb_documentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_documentos (id_documento, id_paciente, documento_tipo, fecha_registro, es_pendiente, fecha_creacion, fecha_modificacion, id_usuario) FROM stdin;
\.


--
-- Data for Name: tb_entregas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_entregas (id_entrega, id_paciente, fecha_entrega, observaciones, estado, fecha_creacion, fecha_modificacion, id_usuario) FROM stdin;
\.


--
-- Data for Name: tb_pacientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_pacientes (id_paciente, msd, nombre, id_tipo_documento, no_documento, direccion, eps, fecha_creacion, fecha_modificacion, id_usuario) FROM stdin;
\.


--
-- Data for Name: tb_tipo_documento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_tipo_documento (id_tipo_documento, descripcion) FROM stdin;
\.


--
-- Data for Name: tb_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_usuarios (id_usuario, usuario, pass, fecha_creacion, fecha_modificacion) FROM stdin;
1	admin_medcol	$2b$10$S4BPX8eJLDHOpKbj6.jNgu3HRCpDW4SlUMTPIqZLYrMcyYTAzLnGS	2025-03-21 16:15:33.34	2025-03-21 15:45:10.897434
\.


--
-- Name: tb_documentos_id_documento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_documentos_id_documento_seq', 1, false);


--
-- Name: tb_entregas_id_entrega_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_entregas_id_entrega_seq', 1, false);


--
-- Name: tb_pacientes_id_paciente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_pacientes_id_paciente_seq', 1, false);


--
-- Name: tb_tipo_documento_id_tipo_documento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_tipo_documento_id_tipo_documento_seq', 1, false);


--
-- Name: tb_usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_usuarios_id_usuario_seq', 1, true);


--
-- Name: tb_documentos tb_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_documentos
    ADD CONSTRAINT tb_documentos_pkey PRIMARY KEY (id_documento);


--
-- Name: tb_entregas tb_entregas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_entregas
    ADD CONSTRAINT tb_entregas_pkey PRIMARY KEY (id_entrega);


--
-- Name: tb_pacientes tb_pacientes_msd_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_pacientes
    ADD CONSTRAINT tb_pacientes_msd_key UNIQUE (msd);


--
-- Name: tb_pacientes tb_pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_pacientes
    ADD CONSTRAINT tb_pacientes_pkey PRIMARY KEY (id_paciente);


--
-- Name: tb_tipo_documento tb_tipo_documento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_tipo_documento
    ADD CONSTRAINT tb_tipo_documento_pkey PRIMARY KEY (id_tipo_documento);


--
-- Name: tb_usuarios tb_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_usuarios
    ADD CONSTRAINT tb_usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: tb_usuarios trigger_actualizar_fecha_modificacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_fecha_modificacion BEFORE UPDATE ON public.tb_usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion();


--
-- Name: tb_documentos trigger_actualizar_fecha_modificacion_tb_documentos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_fecha_modificacion_tb_documentos BEFORE UPDATE ON public.tb_documentos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion();


--
-- Name: tb_entregas trigger_actualizar_fecha_modificacion_tb_entregas; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_fecha_modificacion_tb_entregas BEFORE UPDATE ON public.tb_entregas FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion();


--
-- Name: tb_pacientes trigger_actualizar_fecha_modificacion_tb_pacientes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_fecha_modificacion_tb_pacientes BEFORE UPDATE ON public.tb_pacientes FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion();


--
-- Name: tb_tipo_documento trigger_actualizar_fecha_modificacion_tb_tipo_documento; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_fecha_modificacion_tb_tipo_documento BEFORE UPDATE ON public.tb_tipo_documento FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion();


--
-- Name: tb_documentos tb_documentos_id_paciente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_documentos
    ADD CONSTRAINT tb_documentos_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.tb_pacientes(id_paciente);


--
-- Name: tb_documentos tb_documentos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_documentos
    ADD CONSTRAINT tb_documentos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.tb_usuarios(id_usuario);


--
-- Name: tb_entregas tb_entregas_id_paciente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_entregas
    ADD CONSTRAINT tb_entregas_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.tb_pacientes(id_paciente);


--
-- Name: tb_entregas tb_entregas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_entregas
    ADD CONSTRAINT tb_entregas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.tb_usuarios(id_usuario);


--
-- Name: tb_pacientes tb_pacientes_id_tipo_documento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_pacientes
    ADD CONSTRAINT tb_pacientes_id_tipo_documento_fkey FOREIGN KEY (id_tipo_documento) REFERENCES public.tb_tipo_documento(id_tipo_documento);


--
-- Name: tb_pacientes tb_pacientes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_pacientes
    ADD CONSTRAINT tb_pacientes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.tb_usuarios(id_usuario);


--
-- PostgreSQL database dump complete
--

