"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import pageCss from "./page.module.css";
import authService from "@/services/authService";
import Card from "@/components/card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast, ToastContainer } from "react-toastify";

export default function Dashboard() {
  const [tasks, setTasks] = useState(null);
  const [reloadTasks, setReloadTasks] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = (keep = false) => {
    setShow(false);
    setTitulo("");
    setDescricao("");
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    if (reloadTasks) {
      setTasks(null);
      getTasks();
      setReloadTasks(false);
    }
  }, [reloadTasks]);

  const notify = (message, type = "info") => {
    type = typeof type === "string" ? type : "info";
    toast[type](message);
  };

  const handleClickSalvarTarefa = async () => {
    if (!titulo || !descricao) {
      notify("Preencha todos os campos", "error");
      return;
    }

    const data = await fetch("/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({
        title: titulo,
        description: descricao,
      }),
    });
    if (!data.ok) {
      notify("Erro ao salvar a tarefa", "error");
      return;
    }
    const response = await data.json();
    if (response.error) {
      notify(response.error, "error");
      return;
    }
    notify("Tarefa salva com sucesso", "success");
    setReloadTasks(true);
    handleClose();
  };

  const getTasks = async () => {
    try {
      const response = await fetch("/api/task", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar tarefas");
      }

      const data = await response.json();
      setTasks(data.data);
    } catch (error) {
      notify("Erro ao buscar tarefas:", "error");
    }
  };

  return (
    <div className={pageCss.content}>
      <main className={styles.main}>
        <h4 className={styles.description}>
          Este é um sistema de gerenciamento de tarefas simples, onde você pode
          adicionar, editar e excluir tarefas.
        </h4>
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-primary" onClick={handleShow}>
            Adicionar tarefa
          </button>
        </div>
        <div className={styles.tasks}>
          <h2>Lista de tarefas:</h2>
          <div className="d-flex flex-column">
            {!tasks && (
              <div className="alert alert-info" role="alert">
                Carregando tarefas...
              </div>
            )}
            {tasks && tasks.length === 0 && (
              <div className="alert alert-info" role="alert">
                Nenhuma tarefa encontrada.
              </div>
            )}

            {tasks &&
              tasks.map((task) => (
                <div key={task.id} className={styles.task}>
                  <Card
                    title={task.title}
                    description={task.description}
                    id={task.id}
                    reloadTasks={setReloadTasks}
                    notify={notify}
                  />
                </div>
              ))}
          </div>
          <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Editar Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Titulo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Titulo aqui"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Descrição aqui"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleClickSalvarTarefa}
              >
                Salvar
              </Button>
            </Modal.Footer>
          </Modal>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
}
