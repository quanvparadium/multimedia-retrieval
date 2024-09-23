--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Debian 16.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: data_type_enum; Type: TYPE; Schema: public; Owner: baonguyen
--

CREATE TYPE public.data_type_enum AS ENUM (
    'video',
    'image'
);


ALTER TYPE public.data_type_enum OWNER TO baonguyen;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: data; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.data (
    id integer NOT NULL,
    size bigint NOT NULL,
    type public.data_type_enum NOT NULL,
    "fileName" character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    store character varying DEFAULT 'local'::character varying NOT NULL,
    address character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public.data OWNER TO baonguyen;

--
-- Name: data_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_id_seq OWNER TO baonguyen;

--
-- Name: data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.data_id_seq OWNED BY public.data.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    file_id character varying NOT NULL,
    user_id character varying NOT NULL,
    format character varying NOT NULL,
    collection_id character varying,
    store character varying NOT NULL,
    address character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO baonguyen;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO baonguyen;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: key_frame; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.key_frame (
    id integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    embedding character varying NOT NULL,
    store character varying DEFAULT 'local'::character varying NOT NULL,
    address character varying NOT NULL,
    "dataId" integer
);


ALTER TABLE public.key_frame OWNER TO baonguyen;

--
-- Name: key_frame_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.key_frame_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.key_frame_id_seq OWNER TO baonguyen;

--
-- Name: key_frame_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.key_frame_id_seq OWNED BY public.key_frame.id;


--
-- Name: keyframes; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.keyframes (
    id integer NOT NULL,
    "fileId" character varying NOT NULL,
    "userId" character varying NOT NULL,
    format character varying NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    frame_number integer,
    byte_offset double precision,
    frame_second double precision,
    embedding public.vector(256),
    store character varying NOT NULL,
    address character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.keyframes OWNER TO baonguyen;

--
-- Name: keyframes_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.keyframes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keyframes_id_seq OWNER TO baonguyen;

--
-- Name: keyframes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.keyframes_id_seq OWNED BY public.keyframes.id;


--
-- Name: langchain_pg_collection; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.langchain_pg_collection (
    name character varying,
    cmetadata json,
    uuid uuid NOT NULL
);


ALTER TABLE public.langchain_pg_collection OWNER TO baonguyen;

--
-- Name: langchain_pg_embedding; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.langchain_pg_embedding (
    collection_id uuid,
    embedding public.vector,
    document character varying,
    cmetadata json,
    custom_id character varying,
    uuid uuid NOT NULL
);


ALTER TABLE public.langchain_pg_embedding OWNER TO baonguyen;

--
-- Name: membership; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.membership (
    id integer NOT NULL,
    duration integer NOT NULL,
    price numeric(10,2) NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "maxStorage" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.membership OWNER TO baonguyen;

--
-- Name: membership_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.membership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_id_seq OWNER TO baonguyen;

--
-- Name: membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.membership_id_seq OWNED BY public.membership.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO baonguyen;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO baonguyen;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: query_history; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.query_history (
    id integer NOT NULL,
    "queryMetaData" character varying NOT NULL,
    type character varying NOT NULL,
    message character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public.query_history OWNER TO baonguyen;

--
-- Name: query_history_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.query_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.query_history_id_seq OWNER TO baonguyen;

--
-- Name: query_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.query_history_id_seq OWNED BY public.query_history.id;


--
-- Name: subscribe; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.subscribe (
    id integer NOT NULL,
    "expiredAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer,
    "membershipId" integer
);


ALTER TABLE public.subscribe OWNER TO baonguyen;

--
-- Name: subscribe_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.subscribe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscribe_id_seq OWNER TO baonguyen;

--
-- Name: subscribe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.subscribe_id_seq OWNED BY public.subscribe.id;


--
-- Name: transaction; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.transaction (
    id integer NOT NULL,
    message character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    "beforeBalance" numeric(10,2) NOT NULL,
    "from" character varying NOT NULL,
    reason character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public.transaction OWNER TO baonguyen;

--
-- Name: transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_id_seq OWNER TO baonguyen;

--
-- Name: transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.transaction_id_seq OWNED BY public.transaction.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    email character varying(45) NOT NULL,
    password character varying(80) NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    avatar character varying(200) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public."user" OWNER TO baonguyen;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO baonguyen;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    balance integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    password character varying NOT NULL
);


ALTER TABLE public.users OWNER TO baonguyen;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO baonguyen;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: baonguyen
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    author character varying,
    format character varying,
    duration integer NOT NULL,
    "youtubeId" character varying,
    type character varying NOT NULL,
    status character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    crawl boolean NOT NULL,
    "fileName" character varying NOT NULL,
    size bigint NOT NULL,
    store character varying NOT NULL,
    address character varying NOT NULL
);


ALTER TABLE public.videos OWNER TO baonguyen;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: baonguyen
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO baonguyen;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: baonguyen
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: data id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.data ALTER COLUMN id SET DEFAULT nextval('public.data_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: key_frame id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.key_frame ALTER COLUMN id SET DEFAULT nextval('public.key_frame_id_seq'::regclass);


--
-- Name: keyframes id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.keyframes ALTER COLUMN id SET DEFAULT nextval('public.keyframes_id_seq'::regclass);


--
-- Name: membership id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.membership ALTER COLUMN id SET DEFAULT nextval('public.membership_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: query_history id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.query_history ALTER COLUMN id SET DEFAULT nextval('public.query_history_id_seq'::regclass);


--
-- Name: subscribe id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.subscribe ALTER COLUMN id SET DEFAULT nextval('public.subscribe_id_seq'::regclass);


--
-- Name: transaction id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Name: key_frame PK_0035be5174213930a708c314b8f; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.key_frame
    ADD CONSTRAINT "PK_0035be5174213930a708c314b8f" PRIMARY KEY (id);


--
-- Name: data PK_2533602bd9247937e3a4861e173; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT "PK_2533602bd9247937e3a4861e173" PRIMARY KEY (id);


--
-- Name: subscribe PK_3e91e772184cd3feb30688ef1b8; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.subscribe
    ADD CONSTRAINT "PK_3e91e772184cd3feb30688ef1b8" PRIMARY KEY (id);


--
-- Name: membership PK_83c1afebef3059472e7c37e8de8; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT "PK_83c1afebef3059472e7c37e8de8" PRIMARY KEY (id);


--
-- Name: transaction PK_89eadb93a89810556e1cbcd6ab9; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: query_history PK_d14e08569f855cccc762004f7d1; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.query_history
    ADD CONSTRAINT "PK_d14e08569f855cccc762004f7d1" PRIMARY KEY (id);


--
-- Name: subscribe UQ_78138550e21d8b67790d761148d; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.subscribe
    ADD CONSTRAINT "UQ_78138550e21d8b67790d761148d" UNIQUE ("userId");


--
-- Name: membership UQ_bd32c07f4b89a4697d33bd0f7d3; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT "UQ_bd32c07f4b89a4697d33bd0f7d3" UNIQUE (name);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: keyframes keyframes_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.keyframes
    ADD CONSTRAINT keyframes_pkey PRIMARY KEY (id);


--
-- Name: langchain_pg_collection langchain_pg_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.langchain_pg_collection
    ADD CONSTRAINT langchain_pg_collection_pkey PRIMARY KEY (uuid);


--
-- Name: langchain_pg_embedding langchain_pg_embedding_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.langchain_pg_embedding
    ADD CONSTRAINT langchain_pg_embedding_pkey PRIMARY KEY (uuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: data FK_4ee98a297a032944fb052144963; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT "FK_4ee98a297a032944fb052144963" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: transaction FK_605baeb040ff0fae995404cea37; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: subscribe FK_78138550e21d8b67790d761148d; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.subscribe
    ADD CONSTRAINT "FK_78138550e21d8b67790d761148d" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: query_history FK_90b6da673940bd948a1b8fa8f7e; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.query_history
    ADD CONSTRAINT "FK_90b6da673940bd948a1b8fa8f7e" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: subscribe FK_b329814fde1b6d5e47b4d3ebf69; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.subscribe
    ADD CONSTRAINT "FK_b329814fde1b6d5e47b4d3ebf69" FOREIGN KEY ("membershipId") REFERENCES public.membership(id);


--
-- Name: key_frame FK_fcefd846886555518e58b0a396f; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.key_frame
    ADD CONSTRAINT "FK_fcefd846886555518e58b0a396f" FOREIGN KEY ("dataId") REFERENCES public.data(id);


--
-- Name: langchain_pg_embedding langchain_pg_embedding_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: baonguyen
--

ALTER TABLE ONLY public.langchain_pg_embedding
    ADD CONSTRAINT langchain_pg_embedding_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.langchain_pg_collection(uuid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

