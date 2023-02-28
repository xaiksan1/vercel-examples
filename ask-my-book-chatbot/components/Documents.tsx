import { ListGroup } from "flowbite-react";
import { useState } from "react";

export default function Documents({ dbId }: { dbId: string }) {

  const [books, setBooks] = useState<String[]>([]);

  const fetchBooks = async () => {
    const response = await fetch('/api/books', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          dbId: dbId,
        }),

    });

    const {books} = await response.json();
    setBooks(books)

  };

  if (books.length === 0 && dbId) {
    fetchBooks()
  }

  return (
    <div>
    {books.length !== 0 && (<div><p>Books read: </p>
    <ListGroup>

    {books && books.map((book) => (
       <ListGroup.Item key={book as string}>
📓 {book}
</ListGroup.Item>

  ))}
<ListGroup.Item key="more_books">
👋 Join our&nbsp;<a href="https://steamship.com/discord" className="font-semibold text-gray-900 underline dark:text-white decoration-sky-500">Discord</a>&nbsp;if you want to add more books
</ListGroup.Item>

  </ListGroup></div>
    )
}
  </div>
  );
}
